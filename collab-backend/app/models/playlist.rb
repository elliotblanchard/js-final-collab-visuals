class Playlist < ApplicationRecord
    belongs_to :seed   
          
    @@now_playing

    def now_playing
        @@now_playing
    end

    def now_playing=(id) 
        @@now_playing = id 
    end    
end