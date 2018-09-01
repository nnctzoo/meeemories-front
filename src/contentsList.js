"use strict";

let getContents =  () => {
  $.getJSON(
    'https://picsum.photos/list',
    (data) => {
      var items = [];
      //dataがサーバから受け取るjson値
      $.each(data, (key, val) => {
        console.log(val);
        $('#content').append('<img src="https://picsum.photos/' + val.id +'"></img>');
      });
  });
};


$(()=>{
  getContents();
});
