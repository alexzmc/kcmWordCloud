

## Project Setup

After cloning repo, run `npm ci` to install dependencies.
Create a .env file in the root directory.  Put the parameters necessary for API calls in here, using the following URL and subsituting the password/username to make the API call: 
VITE_BASE_URL=https://content.keepingcurrentmatters.com/api/v1/industries/1/content
VITE_PASSWORD=XXXX
VITE_USERNAME=ZZZZ

## Run project
Run `npm run dev` to start the project and navigate to browser. 

### Notes
The component grabs content from the API, and then parses through the data to get all of the words of the blog post within the specified parameters, then reduces in to an object with the counts of each word.  The child component WordCloud.vue displays the words where words that appear more frequently are larger.  I used the d3 library because it enables the words displayed to be bound to the data. 

The toolbar has a dropdown for categories.  By default, all categories that come through the first request are selected.  Unselecting and reselecting them will filter the data. The Date Range drop down can be used to alter what time frame information comes in.

The range of posts slider can be adjusted to see the progression of posts within the already selected date range.  You can chose a narrower set of date ranges then drag it along the x axis to see how the word cloud changes over a period of time. 

The post limit slider puts a limit on how many posts come back in a request.  You can adjust the length by dragging the left side and move the whole thing at that fixed range by clicking and dragging on the middle or right. 

note - the last requirement about the component automatically updating I was a bit unclear on-- I was not sure if you meant you want it real time, the way to do it would be polling the server at intervals.  However, I don't think this is what it meant because there is only approximately one blog post a day and polling the server constantly is a lot of overhead for something that only updated once a day, plus since this is a word cloud and is a qualitative way to view data so having a real time blog post added in once a day I dont think would add anything meaningful to the wordcloud-- If you meant it needs to be dynamic so refreshing or viewing the component at a different date would include updated data- that is implemented.  
