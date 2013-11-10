import web
import os
import dropbox
import requests
import json
from multiprocessing import Pool, Process
from parse_rest.connection import register
from parse_rest.datatypes import Object

# START CONSTANTS
APP_KEY = '4jhdfov09fjy323'
APP_SECRET = '3hfs6haa2we691w'
db_client = None
auth_code = ''
access_token = ''
SEARCH_CRITERIA = ['.jpg', '.png', '.JPG', '.PNG']
FILE_LIMIT = 1000
THUMBNAIL_SIZE = 'small'
PARSE_APP_ID = 'GU9grS8gubm5pOLsVdWB3YRSAEflX8Aiikz6wUhP'
PARSE_KEY = 'Er5FaHOz2hTgTN6qXcQsRFPCNzHJ2m3adb6MfE5q'
# END CONSTANTS

# START GLOBAL VARIABLES
render = web.template.render('./')
account_info = None
# END GLOBAL VARIABLES


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
  print 'register.......?', reg
  user = myUser(username=account_info['email'], auth_code=access_token)
  user.save()
  print 'user save..........'

  # SEARCH IMAGE FILES
  image_search_res = []
  for file_extension in SEARCH_CRITERIA:
    image_search_res.extend(db_client.search('/', file_extension))
  
  # images = []
  for img in image_search_res:
    photo = File.Query.filter(path=img['path'], username=account_info['email'])
    if photo.count() == 1:
      continue
    photo = File(path=img['path'], username=account_info['email'], date=img['modified'])
    userName = account_info['email']
    path = img['path']
    link = db_client.share(path)["url"] # TO BE USED LATER
    
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
    photo.save()


class index:
  def GET(self):
    return render.index()

class code:
  def setCookie(self, auth_code):
    post_data = {'code':auth_code, 'grant_type':'authorization_code', 'client_id':APP_KEY, 'client_secret':APP_SECRET, 'redirect_uri':'http://localhost:8080/code'}
    post_response = requests.post(url='https://api.dropbox.com/1/oauth2/token', data=post_data)
    access_Obj = json.loads(post_response.content)
    if 'access_token' in access_Obj:
      access_token = access_Obj['access_token']
      print 'access_Obj = ', access_Obj['access_token']
      web.setcookie('mytoken', access_token)

  def GET(self):
    # GET AUTH CODE
    get_input = web.input(_method='get')
    auth_code = ''
    if 'code' in get_input:
      auth_code = get_input.code
      self.setCookie(auth_code)

    # GET AUTH TOKEN AND INSTANTIATE DROPBOX CLIENT
    # if (access_token == None) :
    access_token = web.cookies().get('mytoken')
    # if (access_token == None and auth_code != ''):
    #   self.setCookie(auth_code)
    #   access_token = web.cookies().get('mytoken')
    print 'access_token', type(access_token), ' =====', access_token

    # savePhotos(db_client)
    # pool = Pool(processes=1)
    # result = pool.apply_async(savePhotos, [access_token])
    # print 'pool result = ', result.get()
    p = Process(target=savePhotos, args=(access_token,))
    p.start()
    p.join()

    return render.code()

if __name__ == "__main__":
    urls = (
      '/', 'index',
      '/code', 'code'
    )
    app = web.application(urls, globals())
    app.run()
