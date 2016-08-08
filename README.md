Beacon, an ionic mobile app
=====================

# About this project

Beacon is a mobile app that provides local resources for victims of natural disasters. It has a list of resources shown by geolocation and 50 mile radius. It also allows a user to set a Beacon. Doing this will contact the resources for you via various means. Some will use email, some will use Slack, some will use API calls.

## Remote Services

Beacon connects to various external services based on a user's location. Example Twilio for SMS, Email, Slack, Twitter API, Desk.com API. This allows beacon to send alerts to disaster relief agencies in the area that can respond to needs of a person who needs aid. These services use https://webtask.io and all tasks are in the /web_tasks folder and suffixed by _task.js. ***These endpoints will be tied to resources in the Firebase db but for now they are fired on every beacon save.***

### Using a Webtask

Each webtask has a CURL example in the task. You will have to create a webtask on your own account to test it.

### Creating a Webtask

* create a webtask.io account
* install the webtask cli https://webtask.io/cli
* run the CURL command with your webtask URL and payload info

If your test is successful, it works! You can create your own webtasks and submit a pull request.
