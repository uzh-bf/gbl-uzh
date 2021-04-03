import Head from 'next/head'

export default function Home() {
  return (
    <div>
      <Head>
        <title>GBL@UZH</title>
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
      </Head>
    </div>
  )
}
