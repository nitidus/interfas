//Styles
import styles from '../scss/app.scss';

//Scripts
import $ from 'jquery';
import 'bootstrap';
import axios from 'axios';

import modules from './modules';
const { prototypes } = modules;

const _TARGET_PORT = process.env.APP_PORT || process.env.PORT || 16374,
      _TARGET_HOST = process.env.APP_HOST || process.env.HOST || 'http://localhost',
      _TARGET_API_VERSION = process.env.APP_API_VERSION || process.env.API_VERSION || 'v1';

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

    if (tagInput.getAttribute('placeholder') !== null){
      tagInprocessInput.setAttribute('placeholder', tagInput.getAttribute('placeholder'));
    }

    if (tagInput.id !== ''){
      tagInprocessInput.id = tagInput.id;
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

    if (tagInput.getAttribute('preventReturnKey') === null){
      tagInprocessInput.addEventListener('keyup', (event) => {
        if ((event.keyCode === 13) && (tagInprocessInput.value.trim() != '')){
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
    }

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

            document.getElementById('product-units').addEventListener('keyup', (event) => {
              if (event.target.value.length >= 2){
                axios.get(`${_TARGET_HOST}:${_TARGET_PORT}/api/${_TARGET_API_VERSION}/taxonomies/unit`)
                .then((response) => {
                  if (response.status === 200){
                    let unitsResponse = response.data;

                    if (unitsResponse.meta.code === 200){
                      let units = unitsResponse.data;

                      document.querySelector('.product-unit-items').innerHTML = '';

                      units.filter((unit, j) => {
                        let tagInputContainer = document.getElementById('product-units').parentElement,
                            tagInputs = tagInputContainer.querySelectorAll('span.badge'),
                            finalRowResponse = true;

                        if (tagInputs.length > 0){
                          tagInputs.forEach((badge) => {
                            if ((badge.getAttribute('data-value') == unit._id) || (badge.outerText.replace('close', '').trim() == prototypes._getAppropriateTaxonomyBaseOnLocale(unit.key, 'fa', 'unit'))){
                              finalRowResponse = false;
                            }
                          });
                        }

                        return finalRowResponse;
                      })
                      .filter((unit, j) => {
                        let letterMatchingRegex = new RegExp(`^${event.target.value}`, 'gi');

                        return prototypes._getAppropriateTaxonomyBaseOnLocale(unit.key, 'fa', 'unit').match(letterMatchingRegex);
                      })
                      .forEach((unit, j) => {
                        let unitRowElement = document.createElement('button');

                        unitRowElement.setAttribute('type', 'button');
                        unitRowElement.setAttribute('data-value', unit._id);
                        unitRowElement.classList.add('list-group-item', 'list-group-item-action');
                        unitRowElement.innerHTML = prototypes._getAppropriateTaxonomyBaseOnLocale(unit.key, 'fa', 'unit');

                        unitRowElement.addEventListener('click', () => {
                          let newBadge = document.createElement('span'),
                              newBadgeCloseBtn = document.createElement('i'),
                              newBadgeText = document.createTextNode(unitRowElement.innerHTML);

                          newBadge.setAttribute('data-value', unit._id);
                          newBadge.classList.add('badge', 'badge-primary', 'ml-2', 'mb-2');
                          newBadgeCloseBtn.classList.add('material-icons');
                          newBadgeCloseBtn.innerHTML = 'close';

                          newBadgeCloseBtn.addEventListener('click', () => newBadge.parentNode.removeChild(newBadge));

                          newBadge.appendChild(newBadgeCloseBtn);
                          newBadge.appendChild(newBadgeText);

                          document.getElementById('product-units').parentElement.insertBefore(newBadge, document.getElementById('product-units'));
                          document.getElementById('product-units').value = '';
                          document.querySelector('.product-unit-items').innerHTML = '';
                          document.querySelector('.product-unit-items').classList.add('hide');
                        });

                        document.querySelector('.product-unit-items').appendChild(unitRowElement);
                      });

                      if (document.querySelector('.product-unit-items').classList.contains('hide')){
                        document.querySelector('.product-unit-items').classList.remove('hide');
                      }
                    }
                  }
                });
              }else{
                document.querySelector('.product-unit-items').innerHTML = '';
                document.querySelector('.product-unit-items').classList.add('hide');
              }
            })
            break;

          case 'features-information':
            let productFeaturesControllerElement = document.querySelector('.product-features-controller');

            // <li class="breadcrumb-item mt-2">
            //   <button type="button" class="btn btn-primary append-category">
            //     <i class="material-icons align-middle">add</i>
            //     <span>اضافه‌کردن دسته‌بندی جدید</span>
            //   </button>
            // </li>

            if (productFeaturesControllerElement.childElementCount === 0){
              axios.get(`${_TARGET_HOST}:${_TARGET_PORT}/api/${_TARGET_API_VERSION}/taxonomies/pf`)
              .then((response) => {
                if (response.status === 200){
                  let featuresResponse = response.data;

                  if (featuresResponse.meta.code === 200){
                    let features = featuresResponse.data;

                    features.filter((feature, j) => {
                      return (feature.key.toLowerCase() !== 'unit');
                    })
                    .forEach((feature, j) => {
                      let breadcrumbItem = document.createElement('li'),
                          breadcrumbItemContainer = document.createElement('button'),
                          breadcrumbItemIcon = document.createElement('i'),
                          breadcrumbItemContent = document.createElement('span');

                      breadcrumbItem.classList.add('breadcrumb-item', 'mt-2', 'ml-3');
                      breadcrumbItemContainer.setAttribute('type', 'button');
                      breadcrumbItemContainer.classList.add('btn', 'btn-primary');
                      breadcrumbItemIcon.classList.add('material-icons', 'align-middle');

                      breadcrumbItemIcon.innerHTML = 'add';
                      breadcrumbItemContent.innerHTML = `اضافه کردن ${prototypes._getAppropriateTaxonomyBaseOnLocale(feature.key, 'fa', 'product feature')}`;

                      var breadcrumbItemEvent = () => {};

                      switch (feature.key.toLowerCase()) {
                        case 'description':
                          breadcrumbItemEvent = () => {
                            alert(feature.key.toLowerCase())
                          };
                          break;

                        case 'customized':
                          breadcrumbItemEvent = () => {

                          };
                          break;
                      }

                      breadcrumbItemContainer.addEventListener('click', () => breadcrumbItemEvent());

                      breadcrumbItemContainer.appendChild(breadcrumbItemIcon);
                      breadcrumbItemContainer.appendChild(breadcrumbItemContent);
                      breadcrumbItem.appendChild(breadcrumbItemContainer);
                      productFeaturesControllerElement.appendChild(breadcrumbItem);
                    });
                  }
                }
              })
            }
            break;
        }
      });

      document.querySelectorAll('.form-container button.handler-btn').forEach((item, i) => {
        item.addEventListener('click', () => {
          let selectedHandlerBtn = item.getAttribute('data-target').toLowerCase();

          switch (selectedHandlerBtn) {
            case 'features-information':
              let productName = document.getElementById('product-name').value,
                  productCategory = document.getElementById('product-category').options[document.getElementById('product-category').selectedIndex].value,
                  productInventoryUnits = document.querySelectorAll('.product-units-container .tag-input span.badge'),
                  productTags = document.querySelectorAll('.product-tags-container .tag-input span.badge');

              if ((productName != '') && (productCategory != 'انتخاب دسته‌بندی') && (productInventoryUnits.length > 0) && (productTags.length > 0)){
                document.querySelector('.form-container[data-tab="primary-information"]').classList.remove('active');
                document.querySelector(`.form-container[data-tab="${item.getAttribute('data-target')}"]`).classList.add('active');
              }
              break;
          }
        });
      });
      break;
  }
})
