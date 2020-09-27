class User < ApplicationRecord
    has_secure_password

    has_many :seeds   
    
    validates :username, presence: true  
    validates :username, length: { in: 6..50 }     
    validates :password, presence: true    
    validates :password, length: { in: 6..50 }    
end