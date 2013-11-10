import dropbox
from parse_rest.connection import register
from parse_rest.datatypes import Object
import sys

PARSE_APP_ID = 'GU9grS8gubm5pOLsVdWB3YRSAEflX8Aiikz6wUhP'
PARSE_KEY = 'Er5FaHOz2hTgTN6qXcQsRFPCNzHJ2m3adb6MfE5q'

SEARCH_CRITERIA = ['.jpg', '.png', '.JPG', '.PNG']
FILE_LIMIT = 1000
THUMBNAIL_SIZE = 'small'

class myUser(Object):
  pass

class File(Object):
  pass

def savePhotos(access_token):

  print '=============== savePhotos start ==============='
  # GET USER'S BASIC INFORMATION
  db_client = dropbox.client.DropboxClient(access_token)
  account_info = db_client.account_info()
  print 'get account info..........'

  # save user info to parse
  reg = register(PARSE_APP_ID, PARSE_KEY);
  print 'register.......?'
  userQuery = myUser.Query.filter(username=account_info['email'])
  if userQuery.count() == 0:
    user = myUser(username=account_info['email'], auth_code=access_token)
    user.save()
  else:
    user = userQuery.get()
    user.auth_code = access_token
    user.save()

  print 'user save..........'

  # SEARCH IMAGE FILES
  image_search_res = []
  for file_extension in SEARCH_CRITERIA:
    image_search_res.extend(db_client.search('/iPhone/', file_extension))
  
  # images = []
  print 'image search ........ ' , len(image_search_res)
  for img in image_search_res:
    photo = File.Query.filter(path=img['path'], username=account_info['email'])
    # print 'path = ' ,  img['path']
    if photo.count() == 0:
      # print 'len  = ' , photo.count()
      photo_s = File(path=img['path'], username=account_info['email'], date=img['modified'])
      # userName = account_info['email']
      # path = img['path']
      # link = db_client.share(path)["url"] # TO BE USED LATER
      photo_s.save()
    
    # START SAVE THUMBNAIL
    '''
    thumbnail_path = ""
    if img['thumb_exists']:
      thumbnail = db_client.thumbnail(path, THUMBNAIL_SIZE)
      thumbnail_path = userName + path
      if os.path.isfile(thumbnail_path) == False:
        rindex = thumbnail_path.rfind("/")
        thumbnail_dir = thumbnail_path[0:rindex]
        if not os.path.exists(thumbnail_dir):
          os.makedirs(thumbnail_dir)
        fw = open(thumbnail_path, 'wb')
        fw.write(thumbnail.read())
      photo.thumbnail_path = thumbnail_path
    else:
      thumbnail = None
    # END SAVE THUMBNAIL
    '''

if __name__ == '__main__':
  print 'args = ', sys.argv[1]
  savePhotos(sys.argv[1])