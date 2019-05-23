//Styles
import styles from '../scss/app.scss';

//Scripts
import $ from 'jquery';
import 'bootstrap';
import axios from 'axios';

let tagInputs = document.querySelectorAll('input[type="tags"], input[data-role="tags"]');

if (tagInputs.length > 0){
  tagInputs.forEach((tagInput, i) => {
    let tags = tagInput.getAttribute('value'),
        tagContainer = document.createElement('div'),
        tagInprocessInput = document.createElement('input');

    tagContainer.className = `tag-input ${tagInput.classList}`;
    tagInprocessInput.setAttribute('type', 'text');
    tagInprocessInput.classList.add('inprocess-tag-input');

    if ((tagInput.getAttribute('disabled') !== null) || (tagInput.getAttribute('readonly') !== null)){
      tagInprocessInput.setAttribute('disabled', 'disabled');
    }

    if ((tags !== null) && (tags !== '')){
      tags = tags.split(',');

      tags.forEach((tag, j) => {
        let badge = document.createElement('span'),
            badgeCloseBtn = document.createElement('i'),
            badgeText = document.createTextNode(tag.trim());;

        badge.classList.add('badge', 'badge-primary', 'ml-2');
        badgeCloseBtn.classList.add('material-icons');
        badgeCloseBtn.innerHTML = 'close';

        badgeCloseBtn.addEventListener('click', () => badge.parentNode.removeChild(badge));

        badge.appendChild(badgeCloseBtn);
        badge.appendChild(badgeText);
        tagContainer.appendChild(badge);
      });
    }

    tagInprocessInput.addEventListener('keyup', (event) => {
      if (event.keyCode === 13){
        let newBadge = document.createElement('span'),
            newBadgeCloseBtn = document.createElement('i'),
            newBadgeText = document.createTextNode(tagInprocessInput.value.trim());

        newBadge.classList.add('badge', 'badge-primary', 'ml-2', 'mb-2');
        newBadgeCloseBtn.classList.add('material-icons');
        newBadgeCloseBtn.innerHTML = 'close';

        newBadgeCloseBtn.addEventListener('click', () => newBadge.parentNode.removeChild(newBadge));

        newBadge.appendChild(newBadgeCloseBtn);
        newBadge.appendChild(newBadgeText);

        tagContainer.insertBefore(newBadge, tagInprocessInput);
        tagInprocessInput.value = '';
      }
    });

    tagContainer.appendChild(tagInprocessInput);

    tagInput.parentNode.replaceChild(tagContainer, tagInput);
  });
}

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

    case 'dashboard/products/new':
      document.querySelectorAll('.form-container').forEach((item, i) => {
        let selectedTab = item.getAttribute('data-tab').toLowerCase();

        switch (selectedTab) {
          case 'primary-information':
            let productCategoryElement = document.querySelector('#product-category');

            if (productCategoryElement.childElementCount === 1){
              const _TARGET_PORT = process.env.APP_PORT || process.env.PORT || 16374,
                    _TARGET_HOST = process.env.APP_HOST || process.env.HOST || 'http://localhost',
                    _TARGET_API_VERSION = process.env.APP_API_VERSION || process.env.API_VERSION || 'v1';

              axios.get(`${_TARGET_HOST}:${_TARGET_PORT}/api/${_TARGET_API_VERSION}/taxonomies/pc`)
              .then((response) => {
                if (response.status === 200){
                  let categoriesResponse = response.data;

                  if (categoriesResponse.meta.code === 200){
                    let categories = categoriesResponse.data;

                    categories.forEach((category, j) => {
                      productCategoryElement.innerHTML += `<option value="${category._id}">${(category.cumulative_key || category.key)}</option>`
                    });
                  }
                }
              })
            }
            break;
          default:

        }
      });
      break;
  }
})
