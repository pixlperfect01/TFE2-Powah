common_Localize.defaultLocalizations.h["categories/Powah.name"] = "Powah"


ModTools.makeBuilding("PowahManager", (superClass) => { return {
    update: function(timeMod){
        if(this.timeSinceLastCrawl > 49){
            this.crawlBuildings();
            this.timeSinceLastCrawl = 0;
        } else {
            this.timeSinceLastCrawl += timeMod;
        }
        this.doTransferPowah(timeMod);
    },
    doTransferPowah: function(timeMod){
        let collectedPowah = 0;
        this.connectedProducers.forEach((p) => {
            let prod = this.city.findPermanentByID(p);
            if(prod.storedPowah > 0){
                if(prod.storedPowah > this.maxTransferPerBuilding*timeMod){
                    collectedPowah += this.maxTransferPerBuilding*timeMod;
                    prod.storedPowah -= this.maxTransferPerBuilding*timeMod;
                } else {
                    collectedPowah += prod.storedPowah;
                    prod.storedPowah = 0;
                }
            }
        });
    },
    crawlBuildings: function(){
        this.connectedConsumers = [];
        this.connectedProducers = [];
        this.connectedStorage = [];
        let adjacentBuildingKeys = ["leftBuilding", "rightBuilding", "topBuilding", "bottomBuilding"];
        let tracingNeeded = [this.id];
        let tracedBuildings = [];
        while(tracingNeeded.length > 0){
            let current = this.city.findPermanentByID(tracingNeeded.pop());
            adjacentBuildingKeys.forEach((side)=>{
                if(current[side] != null){
                    if(!tracedBuildings.includes(current[side].id)){
                        if(current[side].isPowahPassthrough){
                            tracingNeeded.push(current[side].id);
                        }
                        if(current[side].isPowahProducer && !this.connectedProducers.includes(current[side].id)){
                            this.connectedProducers.push(current[side].id);
                        }
                        if(current[side].isPowahConsumers && !this.connectedConsumers.includes(current[side].id)){
                            this.connectedConsumers.push(current[side].id);
                        }
                        if(current[side].isPowahStorage && !this.connectedStorage.includes(current[side].id)){
                            this.connectedStorage.push(current[side].id);
                        }
                    }
                }
            });
            tracedBuildings.push(current.id);
        }
    },
    addWindowInfoLines: function(){
		superClass.prototype.addWindowInfoLines.call(this);
        console.log(this.connectedProducers, this.connectedConsumers, this.connectedStorage);
    },
    __constructor__: function(game,stage,bgStage,city,world,position,worldPosition,id) {
        this.isPowahRelated = true;
        this.timeSinceLastCrawl = 50;
        this.connectedProducers = [];
        this.connectedConsumers = [];
        this.connectedStorage = [];
        this.maxTransferPerBuilding = 1000; // most buildings use less than 10/tick

        superClass.call(this,game,stage,bgStage,city,world,position,worldPosition,id);
    }
};}, "powah_manager");


ModTools.makeBuilding("PowahGenerator", (superClass) => { return {
    work: function(citizen, timeMod, shouldStopWorking){
        if(this.storedPowah < this.maxStoredPowah){
            this.storedPowah += this.generatedPerWork * timeMod;
        }
        if(this.storedPowah > this.maxStoredPowah)
            this.storedPowah = this.maxStoredPowah;
        if(shouldStopWorking)
            citizen.stopWork()
    },
    addWindowInfoLines: function(){
		superClass.prototype.addWindowInfoLines.call(this);
        let _this = this;
		this.city.gui.windowAddInfoText(null,function() {
			return Math.floor(_this.storedPowah) + "/" + _this.maxStoredPowah;
		});
    },
    __constructor__: function(game,stage,bgStage,city,world,position,worldPosition,id) {
        this.isPowahRelated = true;
        this.isPowahProducer = true;
        this.storedPowah = 0;
        this.maxStoredPowah = 20000;
        this.generatedPerWork = 0.1;


        superClass.call(this,game,stage,bgStage,city,world,position,worldPosition,id);
    }
};}, "powah_generator", function(queue){
    queue.addFloat(this.storedPowah);
}, function(queue){
    this.storedPowah = queue.readFloat();
});


ModTools.makeBuilding("PowahCable", (superClass) => { return {
    __constructor__: function(game,stage,bgStage,city,world,position,worldPosition,id) {
        this.isPowahRelated = true;
        this.isPowahPassthrough = true;

        superClass.call(this,game,stage,bgStage,city,world,position,worldPosition,id);
    }
};}, "powah_cable");


ModTools.makeBuilding("PowahCell", (superClass) => { return {

    __constructor__: function(game,stage,bgStage,city,world,position,worldPosition,id) {
        this.isPowahRelated = true;
        this.isPowahPassthrough = true;
        this.isPowahStorage = true;
        this.storedPowah = 0;
        this.maxStoredPowah = 200000;

        superClass.call(this,game,stage,bgStage,city,world,position,worldPosition,id);
    },
    addWindowInfoLines: function(){
		superClass.prototype.addWindowInfoLines.call(this);
        let _this = this;
		this.city.gui.windowAddInfoText(null,function() {
			return Math.floor(_this.storedPowah) + "/" + _this.maxStoredPowah;
		});
    },
};}, "powah_cell", function(queue){
    queue.addFloat(this.storedPowah);
}, function(queue){
    this.storedPowah = queue.readFloat();
});