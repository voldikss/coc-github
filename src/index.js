"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var coc_nvim_1 = require("coc.nvim");
var request_1 = require("request");
var child = require("child_process");
function activate(context) {
    return __awaiter(this, void 0, void 0, function () {
        var config, enable, priority, filetypes, source;
        return __generator(this, function (_a) {
            config = coc_nvim_1.workspace.getConfiguration('coc.github');
            enable = config.get('enable', true);
            if (!enable) {
                return [2 /*return*/];
            }
            priority = config.get('priority', 99);
            filetypes = config.get('filetypes', ['gitcommit']);
            source = {
                name: 'github',
                enable: true,
                shortcut: "I",
                filetypes: filetypes,
                priority: priority,
                sourceType: 2,
                triggerCharacters: ['#'],
                doComplete: function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var issues;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getIssues()];
                                case 1:
                                    issues = _a.sent();
                                    return [2 /*return*/, {
                                            items: issues.map(function (i) {
                                                return {
                                                    word: i.character,
                                                    abbr: "#" + i.character + " " + i.description,
                                                    filterText: i.character + i.description
                                                };
                                            })
                                        }];
                            }
                        });
                    });
                }
            };
            context.subscriptions.push(coc_nvim_1.sources.createSource(source));
            return [2 /*return*/];
        });
    });
}
exports.activate = activate;
function getIssues() {
    return __awaiter(this, void 0, void 0, function () {
        var repoUrl, options;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRepoUrl()];
                case 1:
                    repoUrl = _a.sent();
                    options = {
                        url: repoUrl,
                        headers: { 'User-Agent': 'request' }
                    };
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            request_1["default"](options, function (err, res, body) {
                                if (!err && res.statusCode == 200) {
                                    var issues = getCandidates(body);
                                    resolve(issues);
                                }
                                else {
                                    reject([]);
                                }
                            });
                        }).then(function (result) {
                            return result;
                        })["catch"](function (err) {
                            return err;
                        })];
            }
        });
    });
}
function getCandidates(body) {
    var info = JSON.parse(body);
    var candidates = [];
    for (var i = 0, len = info.length; i < len; i++) {
        var issue = {
            character: info[i].number.toString(),
            description: info[i].title
        };
        candidates.push(issue);
    }
    return candidates;
}
function getRepoUrl() {
    return __awaiter(this, void 0, void 0, function () {
        var cmd;
        return __generator(this, function (_a) {
            cmd = 'git remote get-url origin';
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    child.exec(cmd, function (err, stdout, stderr) {
                        if (err) {
                            reject(stderr);
                        }
                        else {
                            var remote = stdout.split('\n')[0];
                            var repoUrl = remote.replace(/\.git$/, '');
                            // for uri like `git@github.com:username/reponame.git`
                            if (repoUrl.startsWith('git')) {
                                var repo = repoUrl.slice(4);
                                var info = repo.split(':', 2);
                                repoUrl = "https://api.github.com/repos/" + info[1] + "/issues?state=all";
                            }
                            resolve(repoUrl);
                        }
                    });
                })];
        });
    });
}
