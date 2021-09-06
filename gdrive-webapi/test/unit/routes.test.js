import { describe, test, expect, jest } from '@jest/globals'
import Routes from '../../src/routes'

describe('#Routes test suid', () => {
  describe('#setSocketInstance', () => {
    test('setSocket should store io instance', () => {
      const routes = new Routes()
      const ioObj = {
        to: (id) => ioObj,
        emit: (e, message) => {}
      }

      routes.setSocketInstance(ioObj)
      expect(routes.io).toStrictEqual(ioObj)
    })

    describe('#handler', () => {
      const defaultParams = {
        request: {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          method: ''
        },
        response: {
          setHeader: jest.fn(),
          writeHead: jest.fn(),
          end: jest.fn()
        },
        values: () => Object.values(defaultParams)
      }

      test('give an inexistent route it should choose default route', async () => {
        const routes = new Routes()
        const params = {
          ...defaultParams
        }
        params.request.method = 'inexistent'
        await routes.handler(...params.values())
        expect(params.response.end).toHaveBeenCalledWith('hello world')
      })

      test.todo('it should set any request with CORS enabled')
      test.todo('given method OPTIONS it should choose options route')
      test.todo('given method POST it should choose post route')
      test.todo('given method GET it should choose get route')
    });
  })
})