var getSampleGeneric = function() {
	var id = Math.floor((Math.random() * 1000) + 1);
    return {
      id: id,
      ref: id,
      shapes: [{
            type: 'circle',
            top: 0, //10
            left: 0, //10
            width: 50,
            height: 50
          },
          {
            type: 'circle',
            top: 50,
            left: 150,
            width: 60,
            height: 60
          }
          ]
    };
}

var getPartsBinItems = function() {
	var items = [];

	for (let i = 0; i < 20; i++) {
		items = items.concat(getSampleGeneric());
	}

	return items;
}

module.exports = getPartsBinItems();