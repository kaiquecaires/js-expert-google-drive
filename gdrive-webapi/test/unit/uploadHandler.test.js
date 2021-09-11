import { describe, test, jest, expect, beforeEach } from '@jest/globals'
import fs from 'fs'
import { pipeline } from 'stream/promises'
import { resolve } from 'path'
import UpdloadHandler from '../../src/updloadHandler.js'
import TestUtil from '../_util/testUtil.js'
import { logger } from '../../src/logger.js'

describe('#UpdloadHandler test suite', () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {}
  }

  beforeEach(() => {
    jest.spyOn(logger, 'info')
    .mockImplementation()
  })
  
  describe('#registerEvents', () => {
    test('should call onfile and onFinish functions on Busboy instance', () => {
      const updloadHandler = new UpdloadHandler({ io: ioObj, socketId: '01' })
      jest.spyOn(updloadHandler, updloadHandler.onFile.name)
        .mockResolvedValue()
      
      const headers = {
        'content-type': 'multipart/form-data; boundary='
      }

      const onFinish = jest.fn()
      const busboyInstance = updloadHandler.registerEvents(headers, onFinish)

      const fileStream = TestUtil.generateReadableStream(['chunck', 'of', 'data'])
      busboyInstance.emit('file', 'fieldname', fileStream, 'filename.txt')
      busboyInstance.listeners('finish')[0].call()

      expect(updloadHandler.onFile).toHaveBeenCalled()
      expect(onFinish).toHaveBeenCalled()
    })
  })

  describe('#onFile', () => {
    test('given a stream file it should save it on disk', async () => {
      const chunks = ['hey', 'dude']
      const downloadsFolder = '/tmp'
      const handler = new UpdloadHandler({
        io: ioObj,
        socketId: '01',
        downloadsFolder
      })

      const onData = jest.fn()

      jest.spyOn(fs, fs.createWriteStream.name)
        .mockImplementation(() => TestUtil.generateWritableStream(onData))

      const onTransform = jest.fn()

      jest.spyOn(handler, handler.handleFileBytes.name)
        .mockImplementation(() => TestUtil.generateTransformStream(onTransform))

      const params = {
        fieldName: 'video',
        file: TestUtil.generateReadableStream(chunks),
        fileName: 'mockfile.mov'
      }

      await handler.onFile(...Object.values(params))

      expect(onData.mock.calls.join()).toEqual(chunks.join())
      expect(onTransform.mock.calls.join()).toEqual(chunks.join())

      const expectedFileName = resolve(handler.downloadsFolder, params.fileName)
      expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFileName)
    })
  })

  describe('#handleFileBytes', () => {
    test('should call emit function and it is a transform stream', async () => {
      jest.spyOn(ioObj, ioObj.to.name)
      jest.spyOn(ioObj, ioObj.emit.name)

      const handler = new UpdloadHandler({
        io: ioObj,
        socketId: '01'
      })

      jest.spyOn(handler, handler.canExecute.name)
        .mockReturnValue(true)

      const messages = ['hello']
      const source = TestUtil.generateReadableStream(messages)
      const onWrite = jest.fn()
      const target = TestUtil.generateWritableStream(onWrite)
      await pipeline(
          source,
          handler.handleFileBytes('filename.txt'),
          target
      )

      expect(ioObj.to).toHaveBeenCalledTimes(messages.length)
      expect(ioObj.emit).toHaveBeenCalledTimes(messages.length)

      // if the handleFileBytes is a transform stream, 
      // our pipeline will be continue the proccess
      // send the data and call our function target every chunk

      expect(onWrite).toBeCalledTimes(messages.length)
      expect(onWrite.mock.calls.join()).toEqual(messages.join())
    })

    test('given message timerDelay as 2 secs it should emit only two messages during 2 seconds period', async () => {
      jest.spyOn(ioObj, ioObj.emit.name)
      const messageTimeDelay = 2000

      const day = '2021-07-01'
      const onFirstLastMessageSent = TestUtil.getTimeFromDate(`${day} 01:01:00`)
      const onFirstCanExecute = TestUtil.getTimeFromDate(`${day} 01:01:02`)
      const onSecondUpdateLastMessageSent = onFirstCanExecute
      const onSecondCanExecute = TestUtil.getTimeFromDate(`${day} 01:01:03`)
      const onThirdCanExecute = TestUtil.getTimeFromDate(`${day} 01:01:04`)

      TestUtil.mockDateNow([
        onFirstLastMessageSent,
        onFirstCanExecute,
        onSecondUpdateLastMessageSent,
        onSecondCanExecute,
        onThirdCanExecute
      ])

      const handler = new UpdloadHandler({
        io: ioObj,
        socketId: '01',
        messageTimeDelay: messageTimeDelay
      })

      const messages = ['hello', 'hello', 'world']
      const expectedMessageSent = 2

      const source = TestUtil.generateReadableStream(messages)

      const filename = 'filename.avi'

      await pipeline(
        source,
        handler.handleFileBytes(filename)
      )

      expect(ioObj.emit).toHaveBeenCalledTimes(expectedMessageSent)

      const [fisrtCallResult, secondCallResult] = ioObj.emit.mock.calls

      expect(fisrtCallResult).toEqual([handler.ON_UPLOAD_EVENT, { processedAlready: 'hello'.length, filename }])
      expect(secondCallResult).toEqual([handler.ON_UPLOAD_EVENT, { processedAlready: messages.join('').length, filename }])
    })
  })

  describe('#canExecute', () => {
    test('should return true when time is later than specified delay', () => {
      const timerDelay = 1000
      const uploadHandler = new UpdloadHandler({
        io: {},
        socketId: '',
        messageTimeDelay: timerDelay
      })
      
      const now = TestUtil.getTimeFromDate('2021-07-01 00:00:03')
      TestUtil.mockDateNow([now])

      const lastExecution = TestUtil.getTimeFromDate('2021-07-01 00:00:00')

     const result = uploadHandler.canExecute(lastExecution)
     expect(result).toBeTruthy()
    })

    test('should return true when time isnt later than specified delay', () => {
      const timerDelay = 3000
      const uploadHandler = new UpdloadHandler({
        io: {},
        socketId: '',
        messageTimeDelay: timerDelay
      })

      const now = TestUtil.getTimeFromDate('2021-07-01 00:00:01')
      TestUtil.mockDateNow([now])

      const lastExecution = TestUtil.getTimeFromDate('2021-07-01 00:00:00')

     const result = uploadHandler.canExecute(lastExecution)
     expect(result).toBeFalsy()
    })
  })
})