class Seed < ApplicationRecord
    belongs_to :user  
    has_many :playlists  
    
    validates :name, presence: true  
    validates :name, length: { in: 6..50 }     
    validates :matrix, presence: true 
    validates :matrix, length: { in: 16..16 }       
end