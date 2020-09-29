class User < ApplicationRecord
    has_secure_password

    has_many :seeds   
    
    validates :username, presence: true  
    validates :username, length: { in: 4..50 }  
    validates :username, uniqueness: { case_sensitive: false }   
    validates :password, presence: true    
    validates :password, length: { in: 6..50 }    
end