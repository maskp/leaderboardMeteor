import { Meteor } from 'meteor/meteor';
PlayersList = new Mongo.Collection('players');


console.log(PlayersList.find().fetch());
Meteor.startup(() => {
  // code to run on server at startup

});
if(Meteor.isServer){
    Meteor.publish('thePlayers', function(){
    // inside the publish function
    return PlayersList.find();
});

}

Meteor.methods({
	'createdPlayer':function(selectedPlayer){
		check(playerNameVar,String);

		var currUserId = Meteor.userId();
		if(currUserId){
		var playerNameVar = ev.target.playerName.value;
    	PlayersList.insert({name:playerNameVar,score:0,createdBy:currUserId});
	}
	},
	'removingPlayers':function(selectedPlayer){
		check(selectedPlayer,String);
		var selectedPlayer = Session.get('selectedPlayer');
		var currUserId = Meteor.userId();
		if(currUserId){
		PlayersList.remove({_id:selectedPlayer,createdBy:currUserId});
		}
	},
	'updateScore':function(selectedPlayer,scoreVal){
		check(selectedPlayer,String);
		check(scoreVal,Number);
		var selectedPlayer = Session.get('selectedPlayer');
		var currUserId = Meteor.userId();
		if(currUserId){
			PlayersList.update({_id:selectedPlayer,createdBy:currUserId},{$inc: {score:scoreVal}});
		}
	}
})


if(Meteor.isClient){
  	Meteor.subscribe('thePlayers',function(){
  		var currentUserId = this.userId;
  		return PlayersList.find({createdBy:currentUserId});
  	});

    Template.leaderboard.helpers({

    	'player':function(){
    		var currUserId = Meteor.userId();
    		return PlayersList.find({createdBy:currUserId},{sort:{score:-1,name:1}})},
    	'selectedClass':function(){
    		var playerId = this._id;
    		var selectedPlayer = Session.get('selectedPlayer');
    		if(playerId == selectedPlayer){
    		return "selected";
    	}
    },
    'selectedPlayer':function(){
    	var selectedPlayer = Session.get('selectedPlayer');
    	return PlayersList.findOne({_id:selectedPlayer});
    }
    });

    Template.leaderboard.events({
    	'click .players':function(){
    		var playerId = this._id;
    		Session.set('selectedPlayer',playerId);
    		var selectedPlayer = Session.get('selectedPlayer');
    		console.log(selectedPlayer);},
    
    	'click .increment':function(){
    		var selectedPlayer = Session.get('selectedPlayer');
    		Meteor.call('updateScore',selectedPlayer,5)
    	},
    	'click .decrement':function(){
    		var selectedPlayer = Session.get('selectedPlayer');
    		Meteor.call('updateScore',selectedPlayer,-5)
    	},
    	'click .remove':function(){
    		var selectedPlayer = Session.get('selectedPlayer');
    		
    		Meteor.call('removingPlayer',selectedPlayer)
    	}
		})

    Template.addPlayerForm.events({
    	'submit form':function(ev){
    		ev.preventDefault();
    		
    		
    		Meteor.call('createdPlayer')
    		ev.target.playerName.value = "";
    	}
    })
}
