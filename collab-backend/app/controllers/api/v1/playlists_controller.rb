class Api::V1::PlaylistsController < ApplicationController
    skip_before_action :authorized, only: [:index, :playing_set, :playing_get] # main screen needs login implemented

    def index
        #TO DO: If the playlist is empty, pick a random seed add it to the playlist, then return it
        playlists = Playlist.all      
        render json: { playlist: PlaylistSerializer.new(playlists) }, status: :accepted
    end 

    def create
        if !Playlist.exists?(seed_id: params[:playlist][:seed_id])
            playlist = Playlist.create(playlist_params)
            if playlist.valid?
                render json: { playlist: PlaylistSerializer.new(playlist) }, status: :created
            else
                render json: { errors: playlist.errors.full_messages }, status: :unprocessible_entity
            end
        else
            #Don't add the seed if it's already on the playlist
            render json: { playlist: "Seed is already on playlist" }, status: :created
        end
    end  
    
    def playing_set
        playlist = Playlist.find(params[:playlist][:id])
        playlist.now_playing = playlist.seed_id
        render json: { playlist: PlaylistSerializer.new(playlist) }, status: :accepted
        playlist.destroy
    end

    def playing_get
        playlist = Playlist.new()
        render json: { nowPlaying: playlist.now_playing }, status: :accepted  
    end
    
    private

    def playlist_params
        params.require(:playlist).permit(:seed_id)
    end    
end