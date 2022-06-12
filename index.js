const express= require("express")
const cors = require("cors")
const axios = require("axios")
const urlMetadata = require('url-metadata')

async function getStoriesOfType(type) {
  const response = await axios.get(`https://hacker-news.firebaseio.com/v0/${type}stories.json?print=pretty`)
  const ids = response.data;
  const promises = ids.map(async (id) => {
      const url = `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
      const response = await axios.get(url)
      const story = response.data

      let metadata
      try {
        if(story.url !== undefined)
        metadata = await urlMetadata(story.url, {timeout: 1000})
      } catch (error) {
        console.log(error)
      }

      const modifiedStory = {
        id,
        ...story,
        imageUrl: (metadata !== undefined && metadata.image.length > 0) ?
          metadata.image :
          "https://source.unsplash.com/400x400"
      }
      return modifiedStory
  })
  //console.log(promises)
  const stories = await Promise.all(promises)
  return stories
}

const app = express()
app.use(cors())

app.get('/MyTopStories', async function(req, res) {
  const stories = await getStoriesOfType("top")
  res.json(stories)
})
app.get('/MyBestStories', async function(req, res) {
  const stories = await getStoriesOfType("best")
  res.json(stories)
})
app.get('/MyNewStories', async function(req, res) {
  const stories = await getStoriesOfType("new")
  res.json(stories)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, function(err){
  if (err)
   console.log(err)
  console.log("Server listening on PORT", PORT)
})