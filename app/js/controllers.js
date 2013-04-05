'use strict';

/* Controllers */


function FilesCtrl($scope, LaputinAPI) {
    $scope.availableTagQuery = "";
    $scope.selectedFiles = [];

    var allTags = [];
    var allFiles = [];

    LaputinAPI.getTags(function (data) {
        var tagsFromAPI = [];
        _.each(data, function (tag) {
            tag.selected = false;
            tagsFromAPI.push(tag);
        });
        allTags = tagsFromAPI;
        $scope.tags = allTags;
    });

    LaputinAPI.getFiles(function (data) {
        allFiles = _.sortBy(data, function (file) { return file.path });
        $scope.selectedFiles = allFiles;
    });

    $scope.openFiles = function (tag) {
        var selectedTags = [];
        _.each(allTags, function (tag) {
            if (tag.selected) {
                selectedTags.push(tag.name);
            }
        });

        LaputinAPI.openFiles(selectedTags);
    };

    $scope.toggleSelection = function (tag) {
        tag.selected = !tag.selected;

        var hashesOfSelectedVideos = [];

        if (_.any(allTags, function () { return tag.selected; })) {
            _.each(allTags, function (tag) {
                if (tag.selected) {
                    hashesOfSelectedVideos.push(_.map(tag.files, function (file) {
                        return file.hash
                    }));
                }
            });
            var intersection = _.intersection.apply(_, hashesOfSelectedVideos);
            $scope.selectedFiles = _.filter(allFiles, function (file) {
                return _.contains(intersection, file.hash);
            });

            if ($scope.selectedFiles.length === 0) {
                $scope.tags = allTags;
            } else {
                var selectedFilesHashes = _.map($scope.selectedFiles, function (file) {
                    return file.hash;
                });
                var fullFileInformation = _.filter(allFiles, function (file) {
                    return _.contains(selectedFilesHashes, file.hash);
                });
                var allTagsOfSelectedFiles = _.map(fullFileInformation, function (file) {
                    return file.tags;
                });
                var union = _.union.apply(_, allTagsOfSelectedFiles);
                var tagNames = _.map(union, function (tag) {
                    return tag.name;
                });
                var uniqueTagNames = _.uniq(tagNames);

                var fullTagInformations = _.filter(allTags, function (tag) {
                    return _.contains(uniqueTagNames, tag.name);
                });

                $scope.tags = fullTagInformations;
            }
        } else {
            $scope.selectedFiles = allFiles;
            $scope.tags = allTags;
        }
    };

    $scope.isTagSelected = function (tag) {
        return tag.selected;
    };

    $scope.isTagUnselected = function (tag) {
        return !tag.selected;
    };

    $scope.tagNameMatches = function (tag) {
        return tag.name.toUpperCase().indexOf($scope.availableTagQuery.toUpperCase()) !== -1;
    };
}

FilesCtrl.$inject = ['$scope', 'LaputinAPI'];


function SingleFileCtrl($scope, $routeParams, LaputinAPI) {
    $scope.availableTagQuery = "";
    $scope.file = undefined;
    $scope.tags = [];
    $scope.newTagName = "";

    var allTags = [];

    function refresh() {
        LaputinAPI.getTags(function (data) {
            var tagsFromAPI = [];
            _.each(data, function (tag) {
                tag.focused = false;
                tag.selected = false;
                tagsFromAPI.push(tag);
            });
            allTags = tagsFromAPI;

            LaputinAPI.getFiles(function (data) {
                var file = _.find(data, function (file) {
                    return file.hash == $routeParams.fileId
                });
                if (typeof file !== 'undefined') {
                    $scope.file = file;
                    updateTagList();
                } else {
                    $scope.file = undefined;
                }
            });
        });
    }

    refresh();

    $scope.addTag = function (tag) {
        $scope.file.tags.push(tag);
        updateTagList();
        LaputinAPI.linkTagToFile(tag, $scope.file);
    };

    $scope.removeTag = function (tag) {
        var idx = $scope.file.tags.indexOf(tag);
        if (idx !== -1) {
            $scope.file.tags.splice(idx, 1);
            LaputinAPI.unlinkTagFromFile(tag, $scope.file);
            updateTagList();
        }
    };

    $scope.createNewTag = function () {
        LaputinAPI.createNewTag($scope.newTagName, function (tag) {
            $scope.newTagName = "";
            $scope.addTag(tag);
        });
    };

    function updateTagList() {
        var tagNames = _.pluck($scope.file.tags, 'name');
        var unusedTags = _.filter(allTags, function (tag) {
            return !_.contains(tagNames, tag.name);
        });

        $scope.tags = unusedTags;
    }

    $scope.tagNameMatches = function (tag) {
        if (typeof tag !== 'undefined')
            return tag.name.toUpperCase().indexOf($scope.availableTagQuery.toUpperCase()) !== -1;
    };

    $scope.openFile = function (file) {
        LaputinAPI.openFile(file, function () {
            console.log("Opened file " + file);
        });
    };

    $scope.addTagIfOnlyOneLeft = function () {
        var tagsLeft = _.filter($scope.tags, $scope.tagNameMatches);
        if (_.size(tagsLeft) === 1) {
            var tag = tagsLeft[0];
            $scope.file.tags.push(tag);
            updateTagList();
            LaputinAPI.linkTagToFile(tag, $scope.file);
            $scope.availableTagQuery = "";
        }
    };
}
SingleFileCtrl.$inject = ['$scope', '$routeParams', 'LaputinAPI'];


function TagsCtrl($scope, LaputinAPI) {
    $scope.availableTagQuery = "";

    var allTags = [];

    LaputinAPI.getTags(function (data) {
        var tagsFromAPI = [];
        _.each(data, function (tag) {
            tag.selected = false;
            tagsFromAPI.push(tag);
        });
        allTags = tagsFromAPI;
        $scope.tags = allTags;
    });

    $scope.tagNameMatches = function (tag) {
        return tag.name.toUpperCase().indexOf($scope.availableTagQuery.toUpperCase()) !== -1;
    };
}
TagsCtrl.$inject = ['$scope', 'LaputinAPI'];

function SingleTagCtrl($scope, $routeParams, LaputinAPI) {
    $scope.availableTagQuery = "";
    $scope.editing = false;
    $scope.allTags = [];

    var tagId = parseInt($routeParams.tagId, 10);
    LaputinAPI.getTags(function (data) {
        $scope.tags = _.sortBy(data, function (tag) { return tag.name });
        $scope.tag = _.find(data, function (tag) {
            return tag.id === tagId;
        });
    });

    $scope.removeFile = function (file) {
        var idx = $scope.tag.files.indexOf(file);
        if (idx !== -1) {
            $scope.tag.files.splice(idx, 1);
            LaputinAPI.unlinkTagFromFile($scope.tag, file);
        }
    };

    $scope.open = function () {
        LaputinAPI.openFiles([$scope.tag.name]);
    };

    $scope.edit = function () {
        $scope.editing = true;
    };

    $scope.save = function () {
        $scope.editing = false;
        LaputinAPI.renameTag($scope.tag.id, $scope.tag);
    };

    $scope.checkFiles = function (event) {
        _.each($scope.tag.files, function (file) {
            file.checked = event.srcElement.checked;
        });
    };

    $scope.linkSelectedToTag = function (tag) {
        _.each($scope.tag.files, function (file) {
            if (file.checked) {
                LaputinAPI.linkTagToFile(tag, file);
            }
        });
    };

    $scope.tagNameMatches = function (tag) {
        return tag.name.toUpperCase().indexOf($scope.availableTagQuery.toUpperCase()) !== -1;
    };

    $scope.removeTagFromSelectedFiles = function () {
        _.each($scope.tag.files, function (file) {
            if (file.checked) {
                LaputinAPI.unlinkTagFromFile($scope.tag, file);
            }
        });
    };
}
SingleTagCtrl.$inject = ['$scope', '$routeParams', 'LaputinAPI'];

function UntaggedFilesCtrl($scope, LaputinAPI) {
    $scope.untaggedFiles = [];

    LaputinAPI.getFiles(function (data) {
        $scope.untaggedFiles = _.filter(data, function (file) {
            return file.tags.length === 0;
        });
    });
}
UntaggedFilesCtrl.$inject = ['$scope', 'LaputinAPI'];