import requests
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

url = 'https://apis.data.go.kr/1421000/bizinfo/pblancBsnsService'
params = {
    'serviceKey': 'FmRJggnPbuErC7S3g3D1K51bawXyTDd7hh/JZP+dkyl5OdU79rlNJ+NZWXUfncUYfKzWtgUj8Ks6oxWvRQdPSg==',
    '_type': 'json',
    'numOfRows': '1',
    'pageNo': '1'
}

response = requests.get(url, params=params, verify=False)
print(response.text)
