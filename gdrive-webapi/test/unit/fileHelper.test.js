import { describe, test, expect, jest } from '@jest/globals'
import fs from 'fs'
import FileHelper from '../../src/fileHelper'

describe('#FileHelper', () => {
  describe('#getFileStatus', () => {
    test('it should return files statuses in correct format', async () => {
      const statMock = {
        dev: 66309,
        mode: 33204,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 3019142,
        size: 3093394,
        blocks: 6048,
        atimeMs: 1630950819593.4062,
        mtimeMs: 1630950819514,
        ctimeMs: 1630950819513.408,
        birthtimeMs: 1630950783138.1025,
        atime: '2021-09-06T17:53:39.593Z',
        mtime: '2021-09-06T17:53:39.514Z',
        ctime: '2021-09-06T17:53:39.513Z',
        birthtime: '2021-09-06T17:53:03.138Z'
      }

      const mockUser = 'kaiquecaires'

      process.env.USER = mockUser

      const filename = 'filename.jpg'

      jest.spyOn(fs.promises, fs.promises.stat.name).mockResolvedValue(statMock)
      jest.spyOn(fs.promises, fs.promises.readdir.name).mockResolvedValue([filename])

      const result = await FileHelper.getFileStatus('/tmp')

      const expectedResult = [
        {
          size: '3.09 MB',
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: filename
        }
      ]

      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`)
      expect(result).toMatchObject(expectedResult)
    })
  })
})
