const https = require('https');
const fs = require('fs');

const file = fs.createWriteStream("public/logo.jpg");
https.get('https://scontent.fdac27-2.fna.fbcdn.net/v/t39.30808-6/497519727_990675726599364_3797434333254117878_n.jpg?stp=dst-jpg_tt6&cstp=mx1280x1280&ctp=s1280x1280&_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEpL10HG6bBgXx-NdGi5Hr0hw_MJk3G1OyHD8wmTcbU7Cs5OvgMZrNyybvI99ZZbPZQkL9eYQvwJHZ-buwwWWFI&_nc_ohc=C8RQGhIi4BkQ7kNvwF9HW8L&_nc_oc=AdpCgPsntlF4tU3F0k89okDH4ucZWmqIvOweB6lXaCDWXiRCnFnc4apo4sowEcPEOE0XUX1-EhOKYfm10vSAtfm9&_nc_zt=23&_nc_ht=scontent.fdac27-2.fna&_nc_gid=K_SfJeWb9rWkaeBIQWAfsg&_nc_ss=7b2a8&oh=00_AQIWGFteZPal0zHuUpqXxFgIJSTWE7S1QZz5cAUaJYm_9w&oe=6AB1E008', function(response) {
  response.pipe(file);
});
