var React = require("react");

var File = require("./File.js");
var open = require("./file-openers/ServerSideOpener");

var Files = React.createClass({
    openFiles: function () {
        open(this.props.files);
    },

    render: function() {
        return <table className="table table-striped">
            <tbody>
                <tr>
                    <th>
                        Showing {this.props.files.length} matching files

                        <a onClick={this.openFiles} className="btn btn-primary pull-right">
                            Open files
                        </a>
                    </th>
                </tr>

                {this.props.files.map(function (file) {
                    return <tr key={file.hash}><td><File file={file} /></td></tr>;
                })}
            </tbody>
        </table>;
    }
});

module.exports = Files;