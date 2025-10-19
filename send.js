import axios from 'axios';

const response = await axios.post('https://hypermsg.net/api/whatsapp/messages/send', {
  phone_number: '+963945210089',
  message: 'كيفك',
  whatsapp_number_id: 18
}, {
  headers: {
    'x-api-key': 'eOd1XQfCJIQyoV20SV8aFc0OL94k7JkdEvoh3tZaW2RZsHKQU2sxaWGmcAQiSts1',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

console.log(response.data);