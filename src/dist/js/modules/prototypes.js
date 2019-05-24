const knowledge = require('../knowledge');

module.exports = {
  _convertKeywordToToken: (keyword) => {
    return keyword.toLowerCase().replace(/(_|-| )/ig, ' ').replace(/\b\w/ig, char => char.toUpperCase());
  },
  _convertTokenToKeyword: (token) => {
    return token.replace(/(_|-| )+/ig, '-').toLowerCase();
  },
  _convertTokenToKey: (token) => {
    return token.replace(/(_|-| )+/ig, '_').toUpperCase();
  },
  _convertTokenToIconName: (token) => {
    return module.exports._convertTokenToKey(token);
  },
  _convertKeywordToBlockToken: (keyword) => {
    return module.exports._convertKeywordToToken(keyword).replace(/ /ig, '');
  },
  _getAppropriateTaxonomyBaseOnLocale: (selectedTaxonomyValue, language, selectedTaxonomy) => {
    var _SELECTED_TAXONOMY = '';

    if (typeof selectedTaxonomy != 'undefined'){
      _SELECTED_TAXONOMY = module.exports._convertTokenToKey(selectedTaxonomy);
    }

    const _FOUNDED_TAXONOMY_INDEX = knowledge.taxonomies.findIndex((taxonomy) => {
            const _TAXONOMY_VALUE = module.exports._convertTokenToKey(taxonomy.value.en),
                  _SELECTED_TAXONOMY_VALUE = module.exports._convertTokenToKey(selectedTaxonomyValue);

            if (_SELECTED_TAXONOMY != ''){
              const _TAXONOMY_KEY = module.exports._convertTokenToKey(taxonomy.key);

              if (_SELECTED_TAXONOMY === _TAXONOMY_KEY){
                return (_SELECTED_TAXONOMY_VALUE === _TAXONOMY_VALUE);
              }
            }else{
              return (_SELECTED_TAXONOMY_VALUE === _TAXONOMY_VALUE);
            }
          });

    if (_FOUNDED_TAXONOMY_INDEX > -1){
      return knowledge.taxonomies[_FOUNDED_TAXONOMY_INDEX].value[language];
    }else{
      return false;
    }
  }
};
