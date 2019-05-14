//Styles
import styles from '../scss/app.scss';

//Scripts
import 'bootstrap';

import { axios } from './modules';

document.addEventListener('click', (event) => {
  if (event.target){
    let selector = event.target.id;

    switch (selector) {
      case 'login-btn':
        let username = document.querySelector('input[name="username"]').value,
            password = document.querySelector('input[name="password"]').value;
alert('ok')
        // if (username != '' && password != ''){
        //   axios.post('/auth', {
        //     username,
        //     password
        //   }).then((response) => {
        //     if (response.status === 200){
        //       let token = response.data.authenticated;
        //
        //       if ((typeof token != 'undefined') && (token === true)){
        //         location.reload();
        //       }
        //     }
        //   })
        // }
        break;
    }
  }
})
