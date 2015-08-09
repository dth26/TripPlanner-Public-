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
    json['address'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div[1]/div/div[2]/ul/li[1]/strong/address/span[@itemprop="streetAddress"]/text()')
    json['city'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div[1]/div/div[2]/ul/li[1]/strong/address/span[@itemprop="addressLocality"]/text()')
    json['state'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div[1]/div/div[2]/ul/li[1]/strong/address/span[@itemprop="addressRegion"]/text()')
    json['zipcode'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div[1]/div/div[2]/ul/li[1]/strong/address/span[@itemprop="postalCode"]/text()')

    # scrape info
    json['name'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[2]/div[1]/h1/text()')
    json['category'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[2]/div[1]/div/div[2]/span[2]/a/text()')
    json['url'] = tree.xpath('/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div[1]/div/div[2]/ul/li[4]/span/div/a[@rel="nofollow"]/text()')

    for key, value in json.iteritems():
        if len(value) >0:
            json[key]= value[0].strip()
        else:
            json[key] = ''

    return jsonify(json)
