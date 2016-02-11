var Tuneful = function () {
    // Initialise the js to show the waveform in the bottom bar
    this.wavesurfer = Object.create(Wavesurfer);
    this.wavesurfer.init({container: '#waveform'});
    this.wavesurfer.on("finish", this.stop.bind(this));
    
    //Call the onPlayButtonClick function when play button is clicked
    this.playButton = $("#play-button");
    this.playIcon = $("#play-button i");
    this.playButton.click(this.onPlayButtonClicked.bind(this));
    this.playing = false;
    
    //When song is clicked to be loaded, call the onSongClicked function
    $("#songs").on("click", ".song",
                    this.onSongClicked.bind(this));
    //When add song button is clicked call the onAddButtonClicked function
    $("#songs").on("click", "#add-ubtton",
                    this.onAddButtonClicked.bind(this));
                    
    //When user selects a file call the onFileAdded function
    this.fileInput = $("#file-input");
    this.fileInput.change(this.onFileAdded.bind(this));
    
    this.uploadForm = $("#upload-form");
    
    this.songList = $("#song-list");
    // compile the song list template from the HTML file
    this.songListTemplate = Handlebars.compile($("#song-list-template").html())
    
    this.luke = $("#luke img");
    
    this.songs = [];
    //get the current list of uploaded songs
    this.getSongs();
};

Tuneful.prototype.onSongClicked = function(event) {
    //called when we load a new song
    this.pause();
    var song = $(event.target);
    //reload the waveform from the path data attribute
    this.wavesurfer.load(song.data("path"));
};

Tuneful.prototype.onPlayButtonClicked = function() {
    //switch between play and pause
    if (this.playing) {
        this.pause();
    }
    else {
        this.play();
    }
};

Tuneful.prototype.togglePlayIcon = function() {
    //toggle play icon between play and pause
    this.playIcon.toggleClass("fa-play");
    this.playIcon.toggleClass("fa-pause");
};

Tuneful.prototype.play = function() {
    if (this.playing) {
        return;
    }
    //start the song playing, and set the play icon
    this.wavesurfer.play();
    this.togglePlayIcon();
    this.luke.toggleClass("spin");
    this.playing = true;
};

Tuneful.prototype.pause = function() {
    if (!this.playing) {
        return;
    }
    //pause the song, and set the pause icon
    this.wavesurfer.pause();
    this.togglePlayIcon();
    this.luke.toggleClass("spin");
    this.playing = false;
};

Tuneful.prototype.stop = function() {
    if (!this.playing) {
        return;
    }
    //pause the song, and set the pause icon
    this.wavesurfer.stop();
    this.togglePlayIcon();
    this.luke.toggleClass("spin");
    this.playing = false;
};

Tuneful.prototype.onAddButtonClicked = function() {
    //fake a click on the file input so we can choose a song
    this.fileInput.click();
};

Tuneful.prototype.onFileAdded = function(event) {
    var file = this.fileInput[0].files[0];
    var name = file.name;
    var size = file.size;
    var type = file.type;
    
    //create a FormData object from the upload form
    var data = new FormData(this.uploadForm[0]);
    //make a POST request to the file upload endpoint
    var ajax = $.ajax('/api/files', {
        type: 'POST',
        xhr: this.createUploadXhr.bind(this),
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        dataType: 'json'
    });
    ajax.done(this.onUploadDone.bind(this));
    ajax.fail(this.onFail.bind(this, "File upload"));
};

Tuneful.prototype.createUploadXhr = function() {
    //XHR file upload magic
    var xhr = new XMLHttpRequest();
    if(xhr.upload) {
        xhr.upload.addEventListener('progress',
                                    this.onUploadProgress.bind(this), false);
    }
    return xhr;
};

Tuneful.prototype.onUploadDone = function(data) {
    //called if the upload succeeds
    console.log("Uploading file succeeded");
    data = {
        file: {
            id: data.id
        }
    }
    //make a POST request to add the song
    var ajax = $.ajax('/api/songs', {
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json'
    });
    ajax.done(this.onAddSongDone.bind(this));
    ajax.fail(this.onFail.bind(this, "Adding song"));
};

Tuneful.prototype.onAddSongDone = function(data) {
    //add the song to the songs array, and update the user interface
    this.songs.push(data);
    this.updateSongView();
};

Tuneful.prototype.onUploadProgress = function(event) {
};

Tuneful.prototype.getSongs = function() {
    //make a get request to list all of the songs
    var ajax = $.ajax('/api/songs', {
        type: 'GET',
        dataType: 'json'
    });
    ajax.done(this.onGetSongsDone.bind(this));
    ajax.fail(this.onFail.bind(this, "Getting song information"));
};

Tuneful.prototype.onGetSongsDone = function(data) {
    //update the songs array, and update the user interface
    this.songs = data;
    this.updateSongView();
};

Tuneful.prototype.updateSongView = function() {
    //render the handlebars template for the song list, and insert it into the DOM
    //
    var context = {
        songs: this.songs
    };
    
    var songList = $(this.songListTemplate(context));
    this.songList.replaceWith(songList);
    this.songList = songList;
};

Tuneful.prototype.onFail = function(what, event) {
    //called when an AJAX call fails
    console.error(what, "failed: ", event.statusText);
};

$(document).ready(function() {
    window.app = new Tuneful();
});

