import { describe, test, jest, expect } from '@jest/globals'
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
})