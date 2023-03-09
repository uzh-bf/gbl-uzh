import { useMutation, useQuery } from '@apollo/client'
import { Switch, Table } from '@uzh-bf/design-system'
import { useEffect, useState } from 'react'
import {
  PerformActionDocument,
  ResultDocument,
} from 'src/graphql/generated/ops'
import { ActionTypes } from 'src/reducers/ActionsReducer'

function Cockpit() {
  const playerState = useQuery(ResultDocument, { fetchPolicy: 'cache-first' })
  const [bankDecisionState, setBankDecisionState] = useState(false)
  const [bondsDecisionState, setBondsDecisionState] = useState(false)
  const [stockDecisionState, setStockDecisionState] = useState(false)

  useEffect(() => {
    setBankDecisionState(
      playerState?.data?.result?.playerResult?.facts.bankDecision
    )
    setBondsDecisionState(
      playerState?.data?.result?.playerResult?.facts.bondDecision
    )
    setStockDecisionState(
      playerState?.data?.result?.playerResult?.facts.stockDecision
    )
  }, [playerState])

  const decisions = [
    {
      name: 'Bank',
      label : 'Invest 50% into bank.',
      effect : setBankDecisionState,
      state : bankDecisionState,
      action : ActionTypes.DECIDE_BANK
    },
    {
      name: 'Bonds',
      label : 'Invest 50% into bonds.',
      effect : setBondsDecisionState,
      state : bondsDecisionState,
      action : ActionTypes.DECIDE_BONDS
    },
    {
      name: 'Stocks',
      label : 'Invest 50% into stocks.',
      effect : setStockDecisionState,
      state : stockDecisionState,
      action : ActionTypes.DECIDE_STOCK
    },
  ];

  const [performAction, updatedPlayerResult] = useMutation(
    PerformActionDocument,
    {
      refetchQueries: 'active',
    }
  )

  // <Table columns={columns} data={data} caption="Table with example data" />
        
  const columns_segment_results = [
    { label: 'Category', accessor: 'cat', sortable: false },
    { label: 'Month 1', accessor: 'mon1', sortable: false },
    { label: 'Month 2', accessor: 'mon2', sortable: false },
    { label: 'Month 3', accessor: 'mon2', sortable: false },
  ]

  const columns_portfolio = [
    { label: 'Category', accessor: 'cat', sortable: false },
    { label: 'Value', accessor: 'val', sortable: false }
  ]

  const data_segment_results = [
    { cat: 'Portfolio: Saving', mon1: 100, mon2: 200, mon3: 300 },
    { cat: 'Portfolio: Stocks', mon1: 100, mon2: 200, mon3: 300 },
    { cat: 'Portfolio: Bonds', mon1: 100, mon2: 200, mon3: 300 },
  ]

  const data_portfolio = [
    { cat: 'Portfolio: Saving', val: 100 },
    { cat: 'Portfolio: Stocks', val: 100 },
    { cat: 'Portfolio: Bonds', val: 100 },
  ]

  console.log(playerState?.data)

  const header = (
    <div className='p-4 border rounded'>
      <div className='font-bold'>
        Playing as {playerState?.data?.result?.playerResult?.player?.name} in game {playerState?.data?.result?.currentGame?.id}
      </div>

      <div className=''>
        Current status: {playerState?.data?.result?.currentGame?.status}
      </div>
    </div>
  )

  switch (playerState?.data?.result?.currentGame?.status) {
    case 'PREPARATION':
      return <div>{header} Game is begin prepared.</div>

    case 'COMPLETED':
      return <div> Game is completed. </div>

    case 'CONSOLIDATION':
      return <div> Game is being consolidated. </div>

    case 'PREPARATION':
      return <div> Game is being prepared. </div>

    case 'RESULTS':
      return <div> RESULTS </div>

    case 'SCHEDULED':
      return <div> Game is scheduled. </div>

    case 'PAUSED':
      return (
        <div> 
          {header}
          <div className='max-w-2xl' >
          <Table columns={columns_segment_results} data={data_segment_results} caption="" />
          </div>
         
        </div>)

    case 'RUNNING':
      return (
       
        <div>
          {header} 
          <div className='max-w-md' >
             <Table columns={columns_portfolio} data={data_portfolio} caption="" />
          </div>
         
          <div className="p-4 border rounded">
          {decisions.map(function(object, i){
              return (
                <div className="p-1">
                  <Switch
                  label={object.label}
                  checked={object.state}
                  id="switch"
                  onCheckedChange={async (cheked) => {
                    object.effect(cheked)
                    await performAction({
                      variables: {
                        type: object.action,
                        payload: JSON.stringify({
                          decision: cheked,
                        }),
                      },
                    })
                  }}
                />
              </div>)
          })}
          </div>
        </div>
      )
  }
} 

export default Cockpit
