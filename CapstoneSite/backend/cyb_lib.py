# import needed libraries 
import hashlib

# function to convert a string to its hash
def string_to_hash( str_in ):

    # initialize hash object 
    h = hashlib.new( "SHA256" )

    # encode the message 
    h.update( str_in.encode() )

    # return the hash of the string 
    return h.hexdigest()
