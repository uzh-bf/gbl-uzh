// // pages/api/countdown.ts

// import { NextApiRequest, NextApiResponse } from 'next'

// let countdown: number = 0
// let clients = new Set<NextApiResponse>()
// let countdownInterval: NodeJS.Timeout | null = null

// // Function to handle the countdown update every second
// const startCountdownInterval = () => {
//   // Stop existing countdown
//   if (countdownInterval) {
//     console.log('countdown clear A')
//     clearInterval(countdownInterval)
//   }

//   countdownInterval = setInterval(() => {
//     if (countdown > 0) {
//       countdown--
//       clients.forEach((client) => {
//         client.write(`data: ${countdown}\n\n`)
//         client.end()
//       })
//     } else {
//       stopCountdownInterval()
//     }
//   }, 1000) // Update every second

//   clients.forEach((client) => client.write(`data: ${countdown}\n\n`))
// }

// const stopCountdownInterval = () => {
//   if (countdownInterval) {
//     clearInterval(countdownInterval)
//     countdownInterval = null
//     countdown = 0
//     clients.forEach((client) => client.write(`data: ${countdown}\n\n`))
//   }
// }

// // API Route to handle both GET and POST requests
// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'GET') {
//     // Set the response headers for SSE
//     res.setHeader('Content-Type', 'text/event-stream')
//     res.setHeader('Cache-Control', 'no-cache')
//     res.setHeader('Connection', 'keep-alive')
//     res.flushHeaders()

//     // Add the new client to the list of clients
//     clients.add(res)
//     // Send the initial countdown time to the new client
//     res.write(`data: ${countdown}\n\n`)

//     // Remove the client from the list when they disconnect
//     req.on('close', () => {
//       clients.delete(res)
//     })

//     console.log('countdown', countdown)
//     console.log('#clients', clients.size)
//     // Start the countdown interval if it hasn't started yet
//   } else if (req.method === 'POST') {
//     // Handle setting the countdown time (for the admin)
//     const { countdownTime } = req.body

//     if (typeof countdownTime === 'number' && countdownTime > 0) {
//       countdown = countdownTime
//       console.log('#clients', clients.size)
//       startCountdownInterval()
//       res.status(200).json({ message: 'Countdown time updated' })
//     } else {
//       res.status(400).json({ message: 'Invalid time' })
//     }
//   }
// }

// pages/api/countdown.ts
import { NextApiRequest, NextApiResponse } from 'next'

let countdown: number = 0
let clients = new Set<NextApiResponse>()
let countdownInterval: NodeJS.Timeout | null = null

const startCountdownInterval = () => {
  console.log('Starting countdown interval')
  console.log('Current clients:', clients.size)

  // Stop existing countdown
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }

  countdownInterval = setInterval(() => {
    if (countdown > 0) {
      countdown--
      console.log('Broadcasting to clients:', clients.size)
      clients.forEach((client) => {
        try {
          client.write(`data: ${countdown}\n\n`)
        } catch (error) {
          console.error('Error writing to client:', error)
          clients.delete(client)
        }
      })
    } else {
      stopCountdownInterval()
    }
  }, 1000)

  // Immediate broadcast to all current clients
  clients.forEach((client) => {
    try {
      client.write(`data: ${countdown}\n\n`)
    } catch (error) {
      console.error('Initial broadcast error:', error)
      clients.delete(client)
    }
  })
}

const stopCountdownInterval = () => {
  console.log('Stopping countdown interval')
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
    countdown = 0
    clients.forEach((client) => {
      try {
        client.write(`data: ${countdown}\n\n`)
      } catch (error) {
        console.error('Stop interval broadcast error:', error)
        clients.delete(client)
      }
    })
  }
}

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   console.log('Request received:', req.method)
//   console.log('Current clients before processing:', clients.size)

//   if (req.method === 'GET') {
//     // Set the response headers for SSE
//     res.setHeader('Content-Type', 'text/event-stream')
//     res.setHeader('Cache-Control', 'no-cache')
//     res.setHeader('Connection', 'keep-alive')
//     res.flushHeaders()

//     // Add the new client to the list of clients
//     clients.add(res)
//     console.log('New client added. Total clients:', clients.size)

//     // Send the initial countdown time to the new client
//     res.write(`data: ${countdown}\n\n`)

//     // Remove the client from the list when they disconnect
//     req.on('close', () => {
//       clients.delete(res)
//       console.log('Client removed. Remaining clients:', clients.size)
//     })
//   } else if (req.method === 'POST') {
//     // Handle setting the countdown time (for the admin)
//     const { countdownTime } = req.body

//     console.log('Received countdown time:', countdownTime)
//     console.log('Clients before starting countdown:', clients.size)

//     if (typeof countdownTime === 'number' && countdownTime > 0) {
//       countdown = countdownTime

//       // Force start interval even if no clients
//       startCountdownInterval()

//       res.status(200).json({
//         message: 'Countdown time updated',
//         clientCount: clients.size,
//       })
//     } else {
//       res.status(400).json({ message: 'Invalid time' })
//     }
//   }
// }

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   console.log('Request method:', req.method)

//   if (req.method === 'GET') {
//     // Explicit SSE headers
//     res.writeHead(200, {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache',
//       Connection: 'keep-open',
//     })

//     // Force flush headers
//     res.flushHeaders()

//     // Add the new client to the list of clients
//     clients.add(res)
//     console.log('New client added. Total clients:', clients.size)

//     // Explicitly send initial data with event type
//     const sendInitialData = () => {
//       console.log('Sending initial data:', countdown)
//       res.write(`event: message\n`)
//       res.write(`data: ${countdown}\n\n`)
//     }

//     sendInitialData()

//     // Remove the client from the list when they disconnect
//     req.on('close', () => {
//       clients.delete(res)
//       console.log('Client removed. Remaining clients:', clients.size)
//     })
//   } else if (req.method === 'POST') {
//     const { countdownTime } = req.body

//     console.log('Received countdown time:', countdownTime)
//     console.log('Clients before starting countdown:', clients.size)

//     if (typeof countdownTime === 'number' && countdownTime > 0) {
//       countdown = countdownTime

//       // Modify broadcast to be more explicit
//       const broadcastCountdown = () => {
//         console.log('Broadcasting to clients:', clients.size)
//         clients.forEach((client) => {
//           try {
//             console.log('Sending data to client:', countdown)
//             client.write(`event: message\n`)
//             client.write(`data: ${countdown}\n\n`)
//           } catch (error) {
//             console.error('Broadcast error:', error)
//             clients.delete(client)
//           }
//         })
//       }

//       broadcastCountdown()

//       // Start interval with explicit broadcasting
//       if (countdownInterval) {
//         clearInterval(countdownInterval)
//       }

//       countdownInterval = setInterval(() => {
//         if (countdown > 0) {
//           countdown--
//           broadcastCountdown()
//         } else {
//           clearInterval(countdownInterval)
//           broadcastCountdown() // Final broadcast
//         }
//       }, 1000)

//       res.status(200).json({
//         message: 'Countdown time updated',
//         clientCount: clients.size,
//       })
//     } else {
//       res.status(400).json({ message: 'Invalid time' })
//     }
//   }
// }

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   console.log('Request method:', req.method)

//   if (req.method === 'GET') {
//     // Extremely explicit SSE setup
//     res.writeHead(200, {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache',
//       Connection: 'keep-open',
//       'Access-Control-Allow-Origin': '*', // Add CORS header
//     })

//     // Force flush headers
//     res.flushHeaders()

//     // Add the new client to the list of clients
//     clients.add(res)
//     console.log('New client added. Total clients:', clients.size)

//     // Extremely verbose initial data sending
//     const sendInitialData = () => {
//       console.log('SERVER: Sending initial data:', countdown)
//       res.write(`id: ${Date.now()}\n`) // Add event ID
//       res.write(`event: countdown\n`) // Explicit event name
//       res.write(`data: ${countdown}\n\n`) // Explicit data
//     }

//     sendInitialData()

//     // Remove the client from the list when they disconnect
//     req.on('close', () => {
//       clients.delete(res)
//       console.log('Client removed. Remaining clients:', clients.size)
//     })
//   } else if (req.method === 'POST') {
//     const { countdownTime } = req.body

//     console.log('Received countdown time:', countdownTime)
//     console.log('Clients before starting countdown:', clients.size)

//     if (typeof countdownTime === 'number' && countdownTime > 0) {
//       countdown = countdownTime

//       const broadcastCountdown = () => {
//         console.log('SERVER: Broadcasting to clients:', clients.size)
//         clients.forEach((client) => {
//           try {
//             console.log('SERVER: Sending data to client:', countdown)
//             client.write(`id: ${Date.now()}\n`)
//             client.write(`event: countdown\n`)
//             client.write(`data: ${countdown}\n\n`)
//           } catch (error) {
//             console.error('Broadcast error:', error)
//             clients.delete(client)
//           }
//         })
//       }

//       broadcastCountdown()

//       if (countdownInterval) {
//         clearInterval(countdownInterval)
//       }

//       countdownInterval = setInterval(() => {
//         if (countdown > 0) {
//           countdown--
//           broadcastCountdown()
//         } else {
//           clearInterval(countdownInterval)
//           broadcastCountdown() // Final broadcast
//         }
//       }, 1000)

//       res.status(200).json({
//         message: 'Countdown time updated',
//         clientCount: clients.size,
//       })
//     } else {
//       res.status(400).json({ message: 'Invalid time' })
//     }
//   }
// }

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // More explicit SSE setup

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',

    'Cache-Control': 'no-cache',

    Connection: 'keep-open',

    'X-Accel-Buffering': 'no',
  })

  // Immediate ping

  res.write(`data: init\n\n`)

  // Keep connection alive

  const intervalId = setInterval(() => {
    console.log('SERVER: Sending ping')

    res.write(`data: ping\n\n`)
  }, 5000)

  req.on('close', () => {
    clearInterval(intervalId)

    res.end()
  })
}
