import { describe, expect, it } from '@jest/globals'
import { TRPCError } from '@trpc/server'
import * as yup from 'yup'
import {
  asTRPCCodeFromServiceError,
  throwAsTRPCError,
} from '../src/trpc/errors.js'
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from '../src/trpc/init.js'
import { createTestContext } from './helpers.js'

describe('asTRPCCodeFromServiceError', () => {
  it('maps INVALID_TOKEN to UNAUTHORIZED', () => {
    expect(asTRPCCodeFromServiceError(new Error('INVALID_TOKEN'))).toBe(
      'UNAUTHORIZED'
    )
  })

  it('maps ACTIONS_NOT_ALLOWED to FORBIDDEN', () => {
    expect(asTRPCCodeFromServiceError(new Error('ACTIONS_NOT_ALLOWED'))).toBe(
      'FORBIDDEN'
    )
  })

  it('maps INVALID_DECISION to BAD_REQUEST', () => {
    expect(asTRPCCodeFromServiceError(new Error('INVALID_DECISION'))).toBe(
      'BAD_REQUEST'
    )
  })

  it('maps an unrecognized Error message to INTERNAL_SERVER_ERROR', () => {
    expect(asTRPCCodeFromServiceError(new Error('SOMETHING_ELSE'))).toBe(
      'INTERNAL_SERVER_ERROR'
    )
  })

  it('maps a non-Error throwable to INTERNAL_SERVER_ERROR', () => {
    expect(asTRPCCodeFromServiceError('just a string')).toBe(
      'INTERNAL_SERVER_ERROR'
    )
  })

  it('maps a yup ValidationError to BAD_REQUEST', async () => {
    const schema = yup.object({ name: yup.string().required() })

    let caught: unknown
    try {
      await schema.validate({})
    } catch (error) {
      caught = error
    }

    expect(caught).toBeInstanceOf(Error)
    expect((caught as Error).name).toBe('ValidationError')
    expect(asTRPCCodeFromServiceError(caught)).toBe('BAD_REQUEST')
  })
})

describe('throwAsTRPCError', () => {
  it('re-throws an existing TRPCError unchanged', () => {
    const original = new TRPCError({
      code: 'FORBIDDEN',
      message: 'custom forbidden',
    })

    expect(() => throwAsTRPCError(original)).toThrow(original)
    try {
      throwAsTRPCError(original)
    } catch (error) {
      expect(error).toBe(original)
      expect((error as TRPCError).code).toBe('FORBIDDEN')
    }
  })

  it('maps a plain service Error to a TRPCError with the mapped code', () => {
    try {
      throwAsTRPCError(new Error('ACTIONS_NOT_ALLOWED'))
      throw new Error('expected throwAsTRPCError to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError)
      expect((error as TRPCError).code).toBe('FORBIDDEN')
      expect((error as TRPCError).message).toBe('ACTIONS_NOT_ALLOWED')
    }
  })

  it('maps an unrecognized Error to INTERNAL_SERVER_ERROR', () => {
    try {
      throwAsTRPCError(new Error('boom'))
      throw new Error('expected throwAsTRPCError to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError)
      expect((error as TRPCError).code).toBe('INTERNAL_SERVER_ERROR')
    }
  })

  it('maps a non-Error throwable to INTERNAL_SERVER_ERROR with a generic message', () => {
    try {
      throwAsTRPCError('just a string')
      throw new Error('expected throwAsTRPCError to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(TRPCError)
      expect((error as TRPCError).code).toBe('INTERNAL_SERVER_ERROR')
      expect((error as TRPCError).message).toBe('Internal server error')
    }
  })
})

describe('service error middleware', () => {
  function failingServiceCall(message: string): never {
    throw new Error(message)
  }

  const router = createTRPCRouter({
    mapped: publicProcedure.query(() => failingServiceCall('INVALID_TOKEN')),
    unmapped: publicProcedure.query(() => failingServiceCall('P2002')),
  })
  const caller = createCallerFactory(router)(createTestContext())

  it('keeps the service error as cause when remapping its code', async () => {
    const error = await caller.mapped().catch((e: unknown) => e)

    expect(error).toBeInstanceOf(TRPCError)
    expect((error as TRPCError).code).toBe('UNAUTHORIZED')
    expect(((error as TRPCError).cause as Error).message).toBe('INVALID_TOKEN')
  })

  it('leaves unmapped failures with their original stack for logging', async () => {
    const error = await caller.unmapped().catch((e: unknown) => e)

    expect((error as TRPCError).code).toBe('INTERNAL_SERVER_ERROR')
    expect(((error as TRPCError).cause as Error).message).toBe('P2002')
    expect((error as TRPCError).stack).toContain('failingServiceCall')
  })
})
