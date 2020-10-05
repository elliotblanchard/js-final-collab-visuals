class Playlist < ApplicationRecord
    belongs_to :seed   
          
    @@now_playing = nil

    def now_playing
        @@now_playing
    end

    def now_playing=(id) 
        @@now_playing = id 
    end    

    #playlist = Playlist.new()
    #playlist.now_playing
    #playlist.now_playing = 10

end