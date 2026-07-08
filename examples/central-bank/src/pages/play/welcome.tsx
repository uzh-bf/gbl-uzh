import { useMutation, useQuery } from "@apollo/client";
import { COLORS } from "@gbl-uzh/platform/src/lib/constants";
import { Logo } from "@gbl-uzh/ui";
import {
  Button,
  FormikSelectField,
  FormikTextField,
} from "@uzh-bf/design-system";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  SelfDocument,
  UpdatePlayerDataDocument,
} from "src/graphql/generated/ops";
import { LOCATIONS } from "src/lib/constants";
import * as Yup from "yup";
import LogoSelector from "~/components/LogoSelector";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@uzh-bf/design-system";

const Schema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(20, "Too Long!")
    .required("Required"),
});

// TODO(JJ):
// - Move modal to ui package
// - LogoSelector

// props:
// - descriptions
// - avatar info, color, location, onSubmit, no player.role
// - add banks, like colors
function Welcome() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data, loading, error } = useQuery(SelfDocument, {
    // fetchPolicy: 'network-cache',
    onError: (error) => {
      console.error("Error fetching player data:", error);
    },
    onCompleted: (data) => {
      if (!data.self) {
        console.warn("No player data found - user may not be authenticated");
      }
    },
  });

  const [updatePlayerData] = useMutation(UpdatePlayerDataDocument, {
    optimisticResponse: {
      updatePlayerData: {
        name: data?.self.name,
        facts: JSON.stringify({
          color: data?.self.facts.color,
          avatar: data?.self.facts.avatar,
          location: data?.self.facts.location,
        }),
      },
    } as any,
    onError: (error) => {
      console.error("Error updating player data:", error);
      setIsSubmitting(false);
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  const gameName = "Central Bank Simulation";

  const player = data.self;

  return (
    <div className="m-auto w-full max-w-4xl p-8">
      <Formik
        initialValues={{
          name: player.name,
          color: player.facts.color ?? Object.keys(COLORS)[0],
          location: player.facts.location ?? LOCATIONS.Trader[0],
          imgPathAvatar:
            player.facts.avatar ?? "/avatars/avatar_placeholder.png",
        }}
        validationSchema={Schema}
        onSubmit={async (values) => {
          setIsSubmitting(true);

          await updatePlayerData({
            variables: {
              name: values.name,
              facts: JSON.stringify({
                color: values.color,
                avatar: values.imgPathAvatar,
                location: values.location,
              }),
            },
          });
          router.replace("/play/cockpit");
        }}
      >
        {({ values, errors, touched }) => (
          <Card className="flex w-full flex-col">
            <CardHeader>
              <CardTitle>Welcome to the {gameName}!</CardTitle>
              <CardDescription>
                Read the introduction and task description, and configure your
                Central Bank governor profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 sm:flex-nowrap  sm:justify-center">
              <div className="flex w-full flex-col gap-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Introduction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="pb-4">
                      Welcome, Governor {values.name}
                      <br />
                      You have been appointed to steer your country&apos;s
                      monetary policy. As the head of the Central Bank, your
                      policy choices will directly affect inflation, employment,
                      and economic growth.
                    </div>
                    <img src="/images/welcome.jpg" className="w-full" />
                    <div className="pt-10">
                      <span className="pb-2 text-2xl font-medium">
                        Your Mandate
                      </span>
                      <div>
                        Each period, you will adjust the policy interest rate.
                        Raising rates cools inflation but slows down growth and
                        increases unemployment. Lowering rates stimulates growth
                        but risks running high inflation. Find the right balance
                        to minimize cumulative penalty losses.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Form className="max-w-1/2 w-full sm:w-max">
                <Card>
                  <CardHeader>
                    <CardTitle>Governor Profile</CardTitle>
                    <CardDescription>
                      Configure your Central Bank profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-8">
                    <div>
                      <Logo
                        color={values.color}
                        location={values.location}
                        name={values.name}
                        imgPathAvatar={values.imgPathAvatar}
                        imgPathLocation={`/locations/${values.location}.svg`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex-initial space-y-1.5">
                        <FormikTextField
                          label="Name of Central Bank"
                          name="name"
                          className={{ label: "pb-2 font-normal" }}
                        />
                        <FormikSelectField
                          label="Location"
                          name="location"
                          items={LOCATIONS.Trader.map((label) => ({
                            value: label,
                            label,
                          }))}
                          className={{
                            root: "w-full",
                            label: "pb-2 font-normal",
                            select: { root: "w-full", trigger: "w-full" },
                          }}
                        />
                        <LogoSelector
                          label="Avatar"
                          className="w-48 pb-2 text-sm text-gray-600"
                          color={values.color}
                          name="imgPathAvatar"
                        />

                        <FormikSelectField
                          label="Color"
                          name="color"
                          items={Object.keys(COLORS).map((label) => ({
                            value: label,
                            label,
                          }))}
                          className={{
                            root: "w-full",
                            label: "pb-2 font-normal",
                            select: { root: "w-full", trigger: "w-full" },
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={{ root: "mt-4" }}
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Loading..." : "Start Game"}
                    </Button>
                  </CardFooter>
                </Card>
              </Form>
            </CardContent>
          </Card>
        )}
      </Formik>
    </div>
  );
}

export default Welcome;
