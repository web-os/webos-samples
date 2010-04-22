function FirstAssistant() {
    this.tests = [
        new OperationQueueTest(),
        new ObserverManagerTest(),
        new CacheManagerTest(),
        new ServiceRequestWrapperTest(),
    ];
}

FirstAssistant.prototype.setup = function() {
    this.infoEl = this.controller.sceneElement.querySelector(".test-status");
    this.failureLog = this.controller.sceneElement.querySelector(".failures");

    setTimeout(this.testRunner(0), 0);
};
FirstAssistant.prototype.testsComplete = function() {
    this.infoEl.innerHTML = $L("Tests complete");

    // TODO : Do this through the app menu or some other UI option
    this.controller.stageController.pushScene("custom-widget");
};

FirstAssistant.prototype.testRunner = function(next) {
    var self = this;
    return function() {
        if (self.tests[next]) {
            self.infoEl.innerHTML = $L("Running test #{num}").interpolate({ num: next });
            self.tests[next].exec(self, self.testRunner(next+1));
        } else {
            self.testsComplete();
        }
    };
};

FirstAssistant.prototype.failure = function(message) {
    var li = this.controller.document.createElement("li");
    li.innerHTML = message;
    this.failureLog.appendChild(li);

    Mojo.Log.error(message);

    try {
        throw new Error("Tracing");
    } catch (err) {
        DebugLogging.logError(err, "|    stack: ");
    }
};

function execChain(assistant, cont, chain, next) {
    return function() {
        try {
            if (chain[next]) {
                Mojo.Log.info("Exec: %s", next);
                chain[next](assistant, execChain(assistant, cont, chain, next+1));
            } else {
                cont();
            }
        } catch (err) {
            DebugLogging.logError(err, "execChain: " + next + ":");
        }
    };
};
