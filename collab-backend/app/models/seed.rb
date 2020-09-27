class Seed < ApplicationRecord
    has_secure_password

    belongs_to :user   
    
    validates :name, presence: true  
    validates :name, length: { in: 6..50 }     
    validates :matrix, presence: true       
end