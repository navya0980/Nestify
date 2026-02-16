const axios=require("axios");

var config = {
  method: 'get',
  url: mapUrl,
  headers: { }
};

axios(config)
.then(function (response) {
  console.log(response.data);
})
.catch(function (error) {
  console.log(error);
});
