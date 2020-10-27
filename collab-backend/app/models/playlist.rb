class Playlist < ApplicationRecord
    belongs_to :seed   
     
    #Implemented as a proof of concept
    
    @@now_playing = nil

    def now_playing
        @@now_playing
    end

    def now_playing=(id) 
        @@now_playing = id 
    end    

end