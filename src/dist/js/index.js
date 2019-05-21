//Styles
import styles from '../scss/app.scss';

//Scripts
import $ from 'jquery';
import 'bootstrap';
import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
  const CONTENT = document.querySelector('body'),
        SOURCE = (CONTENT.getAttribute('data-source') !== null)? CONTENT.getAttribute('data-source'): '';

  switch (SOURCE) {
    case 'authorization':
      document.getElementById('login-btn').addEventListener('click', () => {
        let username = document.querySelector('input[name="username"]').value,
            password = document.querySelector('input[name="password"]').value;

        if (username != '' && password != ''){
          const _TARGET_PORT = process.env.APP_PORT || process.env.PORT || 16374,
                _TARGET_HOST = process.env.APP_HOST || process.env.HOST || 'http://localhost';

          axios.post(`${_TARGET_HOST}:${_TARGET_PORT}/auth`, {
            username,
            password
          }).then((response) => {
            if (response.status === 200){
              let token = response.data.authenticated;

              if ((typeof token != 'undefined') && (token === true)){
                location.reload();
              }
            }
          })
        }
      });
      break;

    case 'dashboard/categories':
      document.querySelectorAll('.append-category').forEach((element, i) => {
        element.addEventListener('click', () => {
          let isParentRelatedToTheRoot = (element.getAttribute('data-is-root') !== null)? ((element.getAttribute('data-is-root') !== "false")? true: false): false,
              currentParentCategory = element.getAttribute('data-category');

          if (currentParentCategory === null){
            currentParentCategory = document.querySelector('.cumulative_key').innerHTML;
          }

          if (!isParentRelatedToTheRoot){
            let currentParentAncestors = element.getAttribute('data-ancestors');

            if (currentParentAncestors === null){
              currentParentAncestors = document.querySelector('.ancestors').innerHTML;
            }

            $('#category-modal').attr('data-ancestors', currentParentAncestors.replace(/\"/gi, ''));
          }

          document.querySelector('#category-modal-label span').innerHTML = currentParentCategory.replace(/\"/gi, '');

          $('#category-modal').modal('show');
        });
      });

      document.querySelector('.submit-category').addEventListener('click', () => {
        let categoryName = document.querySelector('#category-name').value,
            categoryParentName = document.querySelector('#category-modal-label span').innerHTML,
            categoryAncestors = document.querySelector('#category-modal').getAttribute('data-ancestors');

        if (categoryName != ''){
          const _TARGET_PORT = process.env.APP_PORT || process.env.PORT || 16374,
                _TARGET_HOST = process.env.APP_HOST || process.env.HOST || 'http://localhost',
                _TARGET_API_VERSION = process.env.APP_API_VERSION || process.env.API_VERSION || 'v1';

          axios.post(`${_TARGET_HOST}:${_TARGET_PORT}/api/${_TARGET_API_VERSION}/taxonomies?process_content=false`, {
            key: "product category",
            value: categoryName,
            ancestors: categoryAncestors.split(','),
            cumulative_value: `${categoryParentName} ${categoryName}`
          }).then((response) => {
            if (response.status === 200){
              let categoryResponse = response.data;

              if (categoryResponse.meta.code === 200){
                location.reload();
              }
            }
          })
        }
      })
      break;
  }
})
