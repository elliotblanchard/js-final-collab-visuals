class PlaylistSerializer
    include FastJsonapi::ObjectSerializer
    attributes :seed
    #belongs_to :seed
end