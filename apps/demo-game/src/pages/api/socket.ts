// pages/api/socket.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Server } from 'socket.io'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (res.socket.server.io) {
    res.end()
    return
  }

  const io = new Server(res.socket.server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
    },
  })

  let countdownInterval: NodeJS.Timeout | null = null
  let remainingTime = 0

  io.on('connection', (socket) => {
    // Send current state to newly connected client
    if (remainingTime > 0) {
      socket.emit('countdown-update', remainingTime)
    }

    socket.on('start-countdown', (duration) => {
      console.log('Countdown started:', duration)
      // Clear previous interval
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }

      remainingTime = duration

      countdownInterval = setInterval(() => {
        if (remainingTime > 0) {
          remainingTime -= 1
          io.emit('countdown-update', remainingTime)
        } else {
          if (countdownInterval) {
            clearInterval(countdownInterval)
          }
          io.emit('countdown-finished')
        }
      }, 1000)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  // Monkey patching to access socket instance globally.
  ;(global as any).io = io
  res.socket.server.io = io
  console.log('-------------------------')
  console.log('Socket server initialized')
  console.log('-------------------------')

  res.status(200).json({ message: 'Socket server started' })
}
