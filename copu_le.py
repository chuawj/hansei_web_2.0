import requests

url = "https://sugang.hansei.ac.kr/?fake=Tue%20Nov%2018%202025%2019:18:25%20GMT+0900%20(%C7%D1%B1%B9%20%C7%A5%C1%D8%BD%C3)"
response = requests.get(url)

html_code = response.text
print(html_code)  # 페이지 전체 HTML