import type { Prisma } from '../generated/prisma/client.js'

export type GameLookup = { id: number } | { registrationToken: string }
type LockedGame = { id: number }

// Take game locks before reading state used by the operation, inside the same
// read-committed transaction. PostgreSQL releases them on commit or rollback.
// Keep SQL literal: games embed separately generated Prisma clients, which do
// not recognize Prisma.raw fragments constructed by the platform's client.

// Serializes roster changes and lifecycle transitions for this game.
export async function lockGameForUpdate(
  tx: Prisma.TransactionClient,
  where: GameLookup
): Promise<number | null> {
  const rows =
    'id' in where
      ? await tx.$queryRaw<LockedGame[]>`
        SELECT id FROM "Game" WHERE id = ${where.id} FOR UPDATE`
      : await tx.$queryRaw<LockedGame[]>`
        SELECT id FROM "Game" WHERE "registrationToken" = ${where.registrationToken} FOR UPDATE`
  return rows[0]?.id ?? null
}

// Player actions may hold this lock together; ending a segment takes the
// exclusive game lock and waits for those actions to finish.
export async function lockGameForShare(
  tx: Prisma.TransactionClient,
  gameId: number
): Promise<number | null> {
  const rows = await tx.$queryRaw<LockedGame[]>`
    SELECT id FROM "Game" WHERE id = ${gameId} FOR SHARE`
  return rows[0]?.id ?? null
}
