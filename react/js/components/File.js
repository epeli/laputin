var _ = require("underscore");
var React = require("react");

var FileTagList = require("./FileTagList");
var TagAutocompletion = require("./TagAutocompletion");
var LaputinAPI = require("./../utils/LaputinAPI");

var File = React.createClass({
    getInitialState: function () {
        return {
            "mode": "read",
            tags: this.props.file.tags,
            newTagName: "",
            showNewTagCreation: false
        }
    },

    addToSelected: function (tag) {
        var self = this;
        LaputinAPI.addTag(this.props.file, tag, function () {
            self.state.tags.push(tag);
            self.setState({ "tags": self.state.tags });
        });
    },

    edit: function () {
        this.setState({ "mode": "edit" });
    },

    cancel: function () {
        this.setState({ "mode": "read" });
    },

    toggle: function () {
        this.setState({ showNewTagCreation: !this.state.showNewTagCreation });
    },

    open: function () {
        LaputinAPI.openFile(this.props.file);
    },

    remove: function (tag) {
        var self = this;
        LaputinAPI.deleteTagFileAssoc(this.props.file, tag, function () {
            self.setState({ "tags": _.without(self.state.tags, tag) });
        });
    },

    handleNewTagNameChange: function (e) {
        this.setState({ "newTagName": e.target.value });
    },

    onKeyDown: function (e) {
        var self = this;
        if (e.keyCode === 13 || e.keyCode === 14) {
            LaputinAPI.createTag(this.state.newTagName, function (tag) {
                self.setState({ "newTagName": "" });
                self.addToSelected(tag);
            });
        }
    },

    render: function() {
        var tagCreation = "";
        if (this.state.showNewTagCreation) {
            tagCreation = <form>
                <input type="text" value={this.state.newTagName} onChange={this.handleNewTagNameChange} onKeyDown={this.onKeyDown}
                       placeholder="Create a new tag" className="form-control" />
            </form>;
        }

        if (this.state.mode === "edit") {
            var remove = this.remove;
            return <div>
                <p><a onClick={this.cancel}><strong>{this.props.file.name}</strong></a></p>
                <div className="row">
                    <div className="col-md-2">
                        <TagAutocompletion callback={this.addToSelected} selectedTags={this.state.tags} unassociated="1" />

                        <p>
                            <small><a onClick={this.toggle}>Didn't find the tag you were looking for..?</a></small>
                        </p>

                        {tagCreation}

                        <small><a onClick={this.open}>Open only this file</a></small>
                    </div>
                    <div className="col-md-10">
                        {this.state.tags.map(function (tag) {
                            var hack = function () { remove(tag) };
                            return <button onClick={hack} className="btn btn-success tag">{tag.name}</button>;
                        })}
                    </div>
                </div>
            </div>
        }

        return <div>
            <a onClick={this.edit}>{this.props.file.name}</a>
            <FileTagList tags={this.state.tags} />
        </div>;
    }
});



module.exports = File;