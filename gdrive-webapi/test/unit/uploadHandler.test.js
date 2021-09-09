import { describe, test, jest, expect } from '@jest/globals'
import fs from 'fs'
import { resolve } from 'path'
import UpdloadHandler from '../../src/updloadHandler'
import TestUtil from '../_util/testUtil'

describe('#UpdloadHandler test suite', () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {}
  }
  
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
})