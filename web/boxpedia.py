import web
import os
import requests
import json
import subprocess
# from multiprocessing import Pool, Process


# START CONSTANTS
APP_KEY = '4jhdfov09fjy323'
APP_SECRET = '3hfs6haa2we691w'
db_client = None
auth_code = ''
access_token = ''
# END CONSTANTS

# START GLOBAL VARIABLES
render = web.template.render('./')
account_info = None
# END GLOBAL VARIABLES



class index:
  def GET(self):
    return render.index()
class map:
  def GET(self):
    return render.map()

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
    # p = Process(target=savePhotos, args=(access_token,))
    # p.start()
    # p.join()
    # subprocess.call(['python', '../saveToParse.py', access_token])

    return render.code()

if __name__ == "__main__":
    urls = (
      '/', 'index',
      '/code', 'code',
      '/map', 'map'
    )
    app = web.application(urls, globals())
    app.run()
