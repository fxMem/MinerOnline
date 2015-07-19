(function () {
    if (typeof $ !== 'function') {
        throw new Error("jQuery not defined!");
    }

    var window = this || (0, eval)('this');
    var gameHub;
    var connectionStart;
    var connectionStarted = false;
    var playerReady = false;
    var actionFactory = function (header, argumentDataType, data) {
        var action = new CreateDataSource(header, argumentDataType, data);
        return action;
    }

    function updateClient(updateInfo) {
        var messageType = updateInfo.Type;
        switch (messageType) {
            case "ERR": {
                // Пришло сообщение об ошибке
                handleError(updateInfo)
                return;
            }
            case "OK": {


            }
        }

        clientUpdateCallback(updateInfo);
    };

    var lobby = {
        getSessionsList: function () {
            var message = { Header: "LM", Data: { Command: 0 } };

            return gameHub.server.Message(message).done(function (data) {
                checkResponceValid(data);

                return data.Sessions;
            });
        },

        createSession: function () {
            var message = { Header: "LM", Data: { Command: 1 } };

            return gameHub.server.Message(message).done(function (data) {
                checkResponceValid(data);

                if (data.Type != "SC") {
                    throw new Error("Unrecognizeble message type!");
                }

                return data.SessionId;
            });
        },

        enterSession: function (sessionId) {
            var message = { Header: "LM", Data: { Command: 2, SessionId: sessionId } };

            return gameHub.server.Message(message).done(function (data) {
                checkResponceValid(data);

                currentSessionId = sessionId;
            });
        }
    };

    var currentSessionId;
    var clientUpdateCallback;
    var core = {
        initializeClientCallback: function (callback) {
            clientUpdateCallback = callback;
            gameHub = $.connection.rootHub;
            gameHub.client.update = callback;
        },

        startConnection: function () {
            connectionStart = function () {
                return $.connection.hub.start();
            }

            if (connectionStarted) {
                throw new Error("You cannot start connection twice.");
            }

            connectionStarted = true;
            return connectionStart();
        },

        enterGame: function (playerCredentials, playerConfiguration) {
            var inputData = { Header: "UC", Data: playerCredentials };
            return gameHub.server.Connect(inputData);
        },

        voteStart: function () {
            this.Message("GameStartVote", "GSV", { Vote: true });
        },

        leaveGame: function () {
            gameHub.server.Disconnect();
        },

        Message: function (header, actionDataType, data) {
            var dataObject = { };

            var commandObject =
                {
                    ActionHeader: header,
                    GameSessionId: currentSessionId,
                    ArgumentType: actionDataType,
                    Data: dataObject
                };

            copyClientProperties(dataObject, data);

            copyClientProperties()
            return gameHub.server.Message(
                {
                    Header: "AT",
                    
                    Data: commandObject
                });
        },

        setAction: function (actionTag) {
            gameHub.server.Message(actionTag);
        },

        setReady: function () {
            if (playerReady) {
                throw new Error("You cannot set readiness twice.");
            }

            playerReady = true;
            gameHub.server.SetReady();
        }

    };

   

    var plainValley = {
        game: core,
        lobby: lobby,
        actionFactory: actionFactory
    };

    

    if (typeof defined === 'function') {
        define('plainValley', ['signalr.hubs'], plainValley)
    }
    else {
        window["plainValley"] = plainValley;
    }

    

    

    function handleError(data) {
        throw new Error(data.Message);
    }

    function checkResponceValid(data) {
        if (data.Type == "ERR") {
            handleError(data);
        }
    }

    function copyClientCallbacks(clientObject, callbacksObject) {
        for (var item in callbacksObject) {
            if (!callbacksObject.hasOwnProperty(item) || !item || typeof item !== 'function') {
                continue;
            }

            if (item in clientObject) {
                continue;
            }

            clientObject[item] = function () {
                return callbacksObject[item]();
            }
        }
    };

    function copyClientProperties(clientObject, propertiesObject) {
        for (var item in propertiesObject) {
            if (!propertiesObject.hasOwnProperty(item) || !item || typeof item === 'function') {
                continue;
            }

            if (item in clientObject) {
                continue;
            }

            clientObject[item] = propertiesObject[item];
        }
    };

    function CreateDataSource(header, argumentDataType, data) {
        var dataObject = {};

        var commandObject =
            {
                ActionHeader: header,
                GameSessionId: currentSessionId,
                ArgumentType: argumentDataType,
                Data: dataObject
            };

        copyClientProperties(dataObject, data);

        copyClientProperties()

        this.Header = "AT";
        this.Data = commandObject;
    };
})()