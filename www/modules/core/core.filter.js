angular.module('FormBuilderCore').filter('getById', function () {
    return function (input, id) {
        var i = 0, len = input.length;
        for (; i < len; i++) {
            if (+input[i].id == +id) {
                return input[i];
            }
        }
        return null;
    }
});

angular.module('FormBuilderCore').filter('getByQuestionId', function () {
    return function (input, id) {
        var i = 0, len = input.length;
        for (; i < len; i++) {
            if (input[i] && +input[i].question_id == +id) {
                return input[i];
            }
        }
        return null;
    }
});

angular.module('FormBuilderCore').filter('uniqueById', function () {
    return function (collection, keyname) {
        var output = [],
            keys = [];

        angular.forEach(collection, function (item) {
            var key = item[keyname];
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
});

angular.module('FormBuilderCore').filter('orderByIndexInQuestion', function ($filter) {
    return function (collection, questions) {
        var sortedEntries = [];
        questions = $filter('orderBy')(questions, 'index');
        questions.forEach(function (question) {
            sortedEntries.push($filter('getByQuestionId')(collection, question.question_id))
        });
        return sortedEntries;
    };
});

angular.module('FormBuilderCore').filter("nl2br", function () {
    return function (data) {
        if (!data) return data;
        return data.replace(/\n\r?/g, "<br />");
    };
});