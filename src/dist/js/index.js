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

let dropzoneFileInputs = document.querySelectorAll('input[type="file"].dropzone, input[type="file"][data-role="dropzone"], input[data-role="upload"], input[data-role="upload"].dropzone, input[data-role="upload"][data-role="dropzone"]');

if (dropzoneFileInputs.length > 0){
  dropzoneFileInputs.forEach((fileInput, i) => {
    let dropzone = document.createElement('div'),
        dropzoneFileInput = document.createElement('input');

    dropzoneFileInput.setAttribute('type', 'file');
    dropzoneFileInput.setAttribute('name', 'files');
    dropzoneFileInput.setAttribute('multiple', 'multiple');

    if (fileInput.id !== ''){
      let dropzoneFileLabelContainer = document.createElement('div'),
          dropzoneFileLabel = document.createElement('label');

      dropzoneFileInput.id = fileInput.id;
      dropzoneFileLabel.innerHTML = `<strong>تصاویر را انتخاب کنید</strong>`;

      dropzoneFileLabel.setAttribute('for', fileInput.id);
      dropzoneFileLabelContainer.classList.add('label-container')

      dropzoneFileLabelContainer.innerHTML = '<i class="material-icons">photo</i>';

      dropzoneFileLabelContainer.appendChild(dropzoneFileLabel);
      dropzoneFileLabelContainer.appendChild(document.createTextNode(' یا اینجا رها کنید.'));

      dropzone.appendChild(dropzoneFileLabelContainer);
    }

    dropzone.className = `dropzone ${fileInput.classList}`;

    dropzone.appendChild(dropzoneFileInput);

    let createPhotoItemBasedOnTemplate = (files) => {
          for (var k = 0; k < files.length; k++) {
            let droppedFile = files[k],
                fileReader = new FileReader();

            fileReader.onload = function (event){
              let droppedFilesContainer = dropzone.querySelector('.dropped-files'),
                  droppedFileItemContainer = document.createElement('div'),
                  droppedFileItemImage = document.createElement('div'),
                  droppedFileItemController = document.createElement('div'),
                  droppedFileItemControllerMakePrimaryBtn = document.createElement('button'),
                  droppedFileItemControllerMakePrimaryBtnIcon = document.createElement('i'),
                  droppedFileItemControllerRemoveBtn = document.createElement('button'),
                  droppedFileItemControllerRemoveBtnIcon = document.createElement('i');

              if (droppedFilesContainer === null){
                droppedFilesContainer = document.createElement('div');

                droppedFilesContainer.classList.add('dropped-files');

                dropzone.appendChild(droppedFilesContainer);
              }

              droppedFileItemImage.setAttribute('style', `background-image: url(${event.target.result});`);
              droppedFileItemControllerMakePrimaryBtn.setAttribute('type', 'button');
              droppedFileItemControllerRemoveBtn.setAttribute('type', 'button');

              droppedFileItemContainer.classList.add('dropped-file-item');
              droppedFileItemController.classList.add('dropped-file-controller');
              droppedFileItemImage.classList.add('dropped-file-image-preview');
              droppedFileItemControllerMakePrimaryBtn.classList.add('btn', 'btn-secondary', 'make-primary-photo');
              droppedFileItemControllerMakePrimaryBtnIcon.classList.add('material-icons');
              droppedFileItemControllerRemoveBtn.classList.add('btn', 'btn-danger', 'remove-photo-btn');
              droppedFileItemControllerRemoveBtnIcon.classList.add('material-icons');

              droppedFileItemControllerMakePrimaryBtnIcon.innerHTML = 'bookmark';
              droppedFileItemControllerRemoveBtnIcon.innerHTML = 'delete';

              droppedFileItemControllerRemoveBtn.addEventListener('click', () => {
                droppedFileItemContainer.parentNode.removeChild(droppedFileItemContainer);
              });

              droppedFileItemControllerMakePrimaryBtn.addEventListener('click', () => {
                let primarySelectedItem = droppedFilesContainer.querySelector('.dropped-file-item.primary');

                if (primarySelectedItem !== null){
                  primarySelectedItem.classList.remove('primary');
                }

                droppedFileItemContainer.classList.add('primary');
              });

              droppedFileItemControllerMakePrimaryBtn.appendChild(droppedFileItemControllerMakePrimaryBtnIcon);
              droppedFileItemControllerRemoveBtn.appendChild(droppedFileItemControllerRemoveBtnIcon);
              droppedFileItemController.appendChild(droppedFileItemControllerMakePrimaryBtn);
              droppedFileItemController.appendChild(droppedFileItemControllerRemoveBtn);
              droppedFileItemContainer.appendChild(droppedFileItemImage);
              droppedFileItemContainer.appendChild(droppedFileItemController);
              droppedFilesContainer.appendChild(droppedFileItemContainer);
            }

            fileReader.readAsDataURL(droppedFile);
          }
        },
        dragOverEvent = (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!dropzone.classList.contains('dragging')){
            dropzone.classList.add('dragging');
          }
        },
        dragLeaveEvent = (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (dropzone.classList.contains('dragging')){
            dropzone.classList.remove('dragging');
          }
        },
        dropEvent = (e) => {
          e.preventDefault();
          e.stopPropagation();

          let droppedFiles = e.dataTransfer.files;

          createPhotoItemBasedOnTemplate(droppedFiles);
        };

    dropzone.addEventListener('dragover', (event) => dragOverEvent(event));
    dropzone.addEventListener('dragenter', (event) => dragOverEvent(event));
    dropzone.addEventListener('dragleave', (event) => dragLeaveEvent(event));
    dropzone.addEventListener('dragend', (event) => dragLeaveEvent(event));
    dropzone.addEventListener('drop', (event) => {
      dragLeaveEvent(event);
      dropEvent(event);
    });
    dropzoneFileInput.addEventListener('change', (event) => createPhotoItemBasedOnTemplate(dropzoneFileInput.files));

    fileInput.parentNode.replaceChild(dropzone, fileInput);
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
                      let categoryValue = (category.cumulative_key || category.key),
                          categoryOption = document.createElement('option'),
                          categoryOptionContent = document.createTextNode(categoryValue);

                      categoryOption.setAttribute('value', category._id);

                      categoryOption.appendChild(categoryOptionContent);
                      productCategoryElement.appendChild(categoryOption);
                    });

                    productCategoryElement.addEventListener('change', (event) => {
                      let selectedItem = productCategoryElement.options[productCategoryElement.selectedIndex];

                      document.getElementById('product-name').value = selectedItem.innerText;
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
                            let featureContainer = document.createElement('div'),
                                featureDescription = document.createElement('textarea'),
                                featureRemoveHandler = document.createElement('button'),
                                featureRemoveHandlerIcon = document.createElement('i'),
                                featuresContainer = document.getElementById('features-container');

                            if (featuresContainer.querySelector('.alert.empty-warning') !== null){
                              featuresContainer.removeChild(featuresContainer.querySelector('.alert.empty-warning'));

                              if (item.querySelector('.handler-btn').classList.contains('hide')){
                                item.querySelector('.handler-btn').classList.remove('hide');
                              }
                            }

                            featureContainer.setAttribute('data-type-token', feature._id);
                            featureContainer.setAttribute('data-type', 'description');
                            featureContainer.classList.add('feature-container', 'mb-3');
                            featureDescription.setAttribute('placeholder', 'توضیحات');
                            featureDescription.setAttribute('rows', '5');
                            featureDescription.classList.add('form-control');
                            featureRemoveHandler.classList.add('badge', 'badge-danger', 'feature-remove-handler');
                            featureRemoveHandlerIcon.classList.add('material-icons');

                            featureRemoveHandlerIcon.innerHTML = 'delete';

                            featureRemoveHandler.addEventListener('click', () => {
                              featureContainer.parentNode.removeChild(featureContainer);

                              if ((featuresContainer.childElementCount) === 0){
                                featuresContainer.innerHTML = `<div class="alert alert-warning empty-warning" role="alert">` +
                                  `هنوز هیچ ویژگی ایجاد نکرده‌اید.` +
                                `</div>`;

                                if (!item.querySelector('.handler-btn').classList.contains('hide')){
                                  item.querySelector('.handler-btn').classList.add('hide');
                                }
                              }
                            });

                            featureRemoveHandler.appendChild(featureRemoveHandlerIcon);
                            featureContainer.appendChild(featureDescription);
                            featureContainer.appendChild(featureRemoveHandler);

                            featuresContainer.appendChild(featureContainer);
                          };
                          break;

                        case 'customized':
                          breadcrumbItemEvent = () => {
                            let featureContainer = document.createElement('div'),
                                featureFormGroup = document.createElement('div'),
                                featureNameInput = document.createElement('input'),
                                featureValueInput = document.createElement('input'),
                                featureRemoveHandler = document.createElement('button'),
                                featureRemoveHandlerIcon = document.createElement('i'),
                                featuresContainer = document.getElementById('features-container');

                            if (featuresContainer.querySelector('.alert.empty-warning') !== null){
                              featuresContainer.removeChild(featuresContainer.querySelector('.alert.empty-warning'));

                              if (item.querySelector('.handler-btn').classList.contains('hide')){
                                item.querySelector('.handler-btn').classList.remove('hide');
                              }
                            }

                            featureContainer.setAttribute('data-type-token', feature._id);
                            featureContainer.setAttribute('data-type', 'customized');
                            featureContainer.classList.add('feature-container', 'mb-3');
                            featureFormGroup.classList.add('feature-form-group');
                            featureNameInput.setAttribute('type', 'text');
                            featureNameInput.setAttribute('data-type', 'feature-name');
                            featureNameInput.setAttribute('placeholder', 'نام ویژگی شخصی‌سازی‌شده');
                            featureNameInput.classList.add('form-control', 'mb-3');
                            featureValueInput.setAttribute('type', 'text');
                            featureValueInput.setAttribute('data-type', 'feature-value');
                            featureValueInput.setAttribute('placeholder', 'مقدار ویژگی شخصی‌سازی‌شده');
                            featureValueInput.classList.add('form-control');
                            featureRemoveHandler.classList.add('badge', 'badge-danger', 'feature-remove-handler');
                            featureRemoveHandlerIcon.classList.add('material-icons');

                            featureRemoveHandlerIcon.innerHTML = 'delete';

                            featureRemoveHandler.addEventListener('click', () => {
                              featureContainer.parentNode.removeChild(featureContainer);

                              if ((featuresContainer.childElementCount) === 0){
                                featuresContainer.innerHTML = `<div class="alert alert-warning empty-warning" role="alert">` +
                                  `هنوز هیچ ویژگی ایجاد نکرده‌اید.` +
                                `</div>`;

                                if (!item.querySelector('.handler-btn').classList.contains('hide')){
                                  item.querySelector('.handler-btn').classList.add('hide');
                                }
                              }
                            });

                            featureFormGroup.appendChild(featureNameInput);
                            featureFormGroup.appendChild(featureValueInput);
                            featureRemoveHandler.appendChild(featureRemoveHandlerIcon);
                            featureContainer.appendChild(featureFormGroup);
                            featureContainer.appendChild(featureRemoveHandler);

                            featuresContainer.appendChild(featureContainer);
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
        let selectedHandlerBtn = item.getAttribute('data-target').toLowerCase();

        switch (selectedHandlerBtn) {
          case 'features-information':
            item.addEventListener('click', () => {
              let productName = document.getElementById('product-name').value,
                  productCategory = document.getElementById('product-category').options[document.getElementById('product-category').selectedIndex].value,
                  productInventoryUnits = document.querySelectorAll('.product-units-container .tag-input span.badge'),
                  productTags = document.querySelectorAll('.product-tags-container .tag-input span.badge');

              if ((productName != '') && (productCategory != 'انتخاب دسته‌بندی') && (productInventoryUnits.length > 0) && (productTags.length > 0)){
                let selectedItem = document.getElementById('product-category').options[document.getElementById('product-category').selectedIndex].innerText,
                    productNameRegex = new RegExp(`${selectedItem}`, 'gi');

                if (productName.replace(/\"/gi, '').match(productNameRegex) !== null){
                  document.querySelector('.form-container[data-tab="primary-information"]').classList.remove('active');
                  document.querySelector(`.form-container[data-tab="${item.getAttribute('data-target')}"]`).classList.add('active');
                }
              }
            });
            break;

          case 'photos-information':
            item.addEventListener('click', () => {
              let featuresItem = document.querySelectorAll('#features-container .feature-container');

              if (featuresItem.length > 0){
                var isAllFeaturesValidated = true;

                featuresItem.forEach((featureItem, j) => {
                  if (isAllFeaturesValidated !== false){
                    let featureType = featureItem.getAttribute('data-type').toLowerCase(),
                        isFeatureValid = true;

                    switch (featureType) {
                      case 'description':
                        if (featureItem.querySelector('textarea').value == ''){
                          isFeatureValid = false;
                        }
                        break;

                      case 'customized':
                        if ((featureItem.querySelector('.feature-form-group input[data-type="feature-name"]').value == '') && (featureItem.querySelector('.feature-form-group input[data-type="feature-value"]').value == '')){
                          isFeatureValid = false;
                        }
                        break;
                    }

                    if (isFeatureValid === false){
                      isAllFeaturesValidated = false;
                    }
                  }
                });

                if (isAllFeaturesValidated !== false){
                    document.querySelector('.form-container[data-tab="features-information"]').classList.remove('active');
                    document.querySelector(`.form-container[data-tab="${item.getAttribute('data-target')}"]`).classList.add('active');
                }
              }
            });
            break;

          case 'submit-information':
            item.addEventListener('click', () => {
              let productName = document.getElementById('product-name').value,
                  productCategory = document.getElementById('product-category').options[document.getElementById('product-category').selectedIndex].value,
                  productInventoryUnits = document.querySelectorAll('.product-units-container .tag-input span.badge'),
                  productTags = document.querySelectorAll('.product-tags-container .tag-input span.badge'),
                  productIsVerified = document.querySelector('#verified-checkbox').checked,
                  featuresItem = document.querySelectorAll('#features-container .feature-container'),
                  photosItem = document.querySelectorAll('.product-photos-dropzone .dropped-files .dropped-file-item'),
                  requestParameters = {};

              if ((productName != '') && (productCategory != 'انتخاب دسته‌بندی') && (productInventoryUnits.length > 0) && (productTags.length > 0) && (photosItem.length > 0)){
                let isPrimaryPhotoDefined = false,
                    targetProductInventoryUnits = [],
                    targetProductTags = [],
                    targetProductFeatures = [],
                    targetProductPhotos = [];

                requestParameters.name = productName;
                requestParameters.category_id = productCategory;

                for (var j = 0; j < productInventoryUnits.length; j++) {
                  targetProductInventoryUnits.push(productInventoryUnits[j].getAttribute('data-value'));
                }

                for (var j = 0; j < productTags.length; j++) {
                  let productTagRow = productTags[j].innerText.replace(/^close/gi, '');

                  targetProductTags.push(productTagRow);
                }

                for (var j = 0; j < featuresItem.length; j++) {
                  let featureItem = featuresItem[j],
                      featureType = featureItem.getAttribute('data-type').toLowerCase();

                  switch (featureType) {
                    case 'description':
                      targetProductFeatures.push({
                        feature_id: featureItem.getAttribute('data-type-token'),
                        description: featureItem.querySelector('textarea').value
                      });
                      break;

                    case 'customized':
                      targetProductFeatures.push({
                        feature_id: featureItem.getAttribute('data-type-token'),
                        feature_name: featureItem.querySelector('.feature-form-group input[data-type="feature-name"]').value,
                        feature_value: prototypes._convertDigitsToEnglish(featureItem.querySelector('.feature-form-group input[data-type="feature-value"]').value)
                      });
                      break;
                  }
                }

                for (var j = 0; j < photosItem.length; j++) {
                  let photoItem = photosItem[j],
                      photoItemURI = photoItem.querySelector('.dropped-file-image-preview').style.backgroundImage,
                      strippedPhotoItemURI = photoItemURI.replace(/^url\("/gi, '').replace(/"\)$/gi, '').trim(),
                      photoRow = {
                        content: strippedPhotoItemURI
                      };

                  if (photoItem.classList.contains('primary')){
                    photoRow.primary = true;
                    isPrimaryPhotoDefined = true;
                  }

                  targetProductPhotos.push(photoRow);
                }

                if (isPrimaryPhotoDefined === true){
                  requestParameters.tags = targetProductTags;
                  requestParameters.inventory_units = targetProductInventoryUnits;
                  requestParameters.features = targetProductFeatures;
                  requestParameters.photos = targetProductPhotos;

                  if (productIsVerified === true){
                    requestParameters.verified = true;
                  }

                  axios.post(`${_TARGET_HOST}:${_TARGET_PORT}/products`, requestParameters)
                  .then((response) => {
                    if (response.status === 200){
                      let productResponse = response.data;

                      if (productResponse.meta.code === 200){
                        location.replace('/products');
                      }
                    }
                  })
                }
              }
            });
            break;
        }
      });
      break;
  }
})
