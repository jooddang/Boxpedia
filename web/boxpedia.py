import web
import os
import dropbox
import requests
import json
import exifread

# START CONSTANTS
APP_KEY = '4jhdfov09fjy323'
APP_SECRET = '3hfs6haa2we691w'
db_client = None
auth_code = ''
access_token = ''
SEARCH_CRITERIA = ['.abc']#['jpg', '.png']
FILE_LIMIT = 1000
THUMBNAIL_SIZE = 'small'
# END CONSTANTS

# START GLOBAL VARIABLES
render = web.template.render('./')
account_info = None
# END GLOBAL VARIABLES

class index:
  def GET(self):
    return render.index()

class code:
  def GET(self):
    # GET AUTH CODE
    get_input = web.input(_method='get')
    auth_code = get_input.code

    # GET AUTH TOKEN AND INSTANTIATE DROPBOX CLIENT
    post_data = {'code':auth_code, 'grant_type':'authorization_code', 'client_id':APP_KEY, 'client_secret':APP_SECRET, 'redirect_uri':'http://localhost:8080/code'}
    post_response = requests.post(url='https://api.dropbox.com/1/oauth2/token', data=post_data)
    access_Obj = json.loads(post_response.content)
    access_token = access_Obj['access_token']
    db_client = dropbox.client.DropboxClient(access_token)

    # GET USER'S BASIC INFORMATION
    account_info = db_client.account_info()

    # SEARCH IMAGE FILES
    image_search_res = []
    for file_extension in SEARCH_CRITERIA:
      image_search_res.extend(db_client.search('/', file_extension))
    
    images = []
    for img in image_search_res:
      userName = account_info['email']
      path = img['path']
      date = img['modified']
      # link = db_client.share(path)["url"] # TO BE USED LATER
      
      # START SAVE THUMBNAIL
      thumbnail_path = ""
      if img['thumb_exists']:
        thumbnail = db_client.thumbnail(path, THUMBNAIL_SIZE)
        thumbnail_path = userName + path
        rindex = thumbnail_path.rfind("/")
        thumbnail_dir = thumbnail_path[0:rindex]
        if not os.path.exists(thumbnail_dir):
          os.makedirs(thumbnail_dir)
        fw = open(thumbnail_path, 'wb')
        fw.write(thumbnail.read())
      else:
        thumbnail = None
      # END SAVE THUMBNAIL

      images.append({"path":path, "userName":userName, "thumbnail_path":thumbnail_path, "latitude":0, "longitude":0, "date":date})
      # TODO:PASS images TO EK
    return render.code()

if __name__ == "__main__":
    urls = (
      '/', 'index',
      '/code', 'code'
    )
    app = web.application(urls, globals())
    app.run()
