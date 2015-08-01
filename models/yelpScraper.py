from flask import jsonify, request
from lxml import html
from app import app
import requests


@app.route('/scrapeYelp', methods=['GET'])
def scrape():
    json = {}

    # set up scraper
    url = request.args.get('url')
    page = requests.get(url)
    tree = html.fromstring(page.text)       # parse html file as tree structure

    # scrape address
    json['address'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div[1]/div/div[2]/ul/li[1]/strong/address/span[@itemprop="streetAddress"]/text()')[0].strip()
    json['city'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div[1]/div/div[2]/ul/li[1]/strong/address/span[@itemprop="addressLocality"]/text()')[0].strip()
    json['state'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div[1]/div/div[2]/ul/li[1]/strong/address/span[@itemprop="addressRegion"]/text()')[0].strip()
    json['zipcode'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div[1]/div/div[2]/ul/li[1]/strong/address/span[@itemprop="postalCode"]/text()')[0].strip()

    # scrape info
    json['name'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[2]/div[1]/h1/text()')[0].strip()
    json['category'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[2]/div[1]/div/div[2]/span[2]/a/text()')[0].strip()
    json['url'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div[1]/div/div[2]/ul/li[4]/span/div/a[@rel="nofollow"]/text()')
    if len(json['url']) > 0:
        json['url'] = json['url'][0].strip()
    else:
        json['url'] = ''

    return jsonify(json)
