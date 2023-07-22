import {Badge, Box, Drawer, makeStyles, Tooltip, Typography} from "@material-ui/core";
import React, {useState, useEffect, useRef} from "react";
import SariskaMediaTransport from "sariska-media-transport";
import {color} from "../../../assets/styles/_color";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import CreateIcon from '@material-ui/icons/Create';
import AlbumIcon from '@material-ui/icons/Album';
import ClosedCaptionIcon from '@material-ui/icons/ClosedCaption';
import DetailsIcon from "@material-ui/icons/Details";
import GroupIcon from '@material-ui/icons/Group';
import CommentIcon from '@material-ui/icons/Comment';
import PublicIcon from '@material-ui/icons/Public';
import DescriptionIcon from '@material-ui/icons/Description';
import Logo from "../Logo";
import CopyLink from "../CopyLink";
import ViewComfyIcon from '@material-ui/icons/ViewComfy';
import {useSelector, useDispatch} from "react-redux";
import {setLayout} from "../../../store/actions/layout";
import {RECEIVED_PRESENTATION_STATUS, GET_PRESENTATION_STATUS, GRID, PRESENTATION, SHARED_DOCUMENT, WHITEBOARD, DROPBOX_APP_KEY, EXIT_FULL_SCREEN_MODE, RECORDING_ERROR_CONSTANTS} from "../../../constants";
import classnames from "classnames";
//import Chat from "../Chat";
//import ParticipantDetails from "../ParticipantDetails";
import VirtualBackground from "../VirtualBackground";
import FlipToFrontOutlinedIcon from '@material-ui/icons/FlipToFrontOutlined';
import SettingsIcon from "@material-ui/icons/Settings";
import {withStyles} from '@material-ui/core/styles';
//import {unreadMessage} from "../../../store/actions/chat";
import {setPresentationtType} from "../../../store/actions/layout";
import SettingsBox from "../../meeting/Settings"; 
import {showNotification} from "../../../store/actions/notification";
import googleApi from "../../../utils/google-apis";
import LiveStreamDialog from "../LiveStreamDialog";
import {authorizeDropbox} from "../../../utils/dropbox-apis";
import Whiteboard from "../Whiteboard";
import { addSubtitle } from "../../../store/actions/subtitle";
import { showSnackbar } from "../../../store/actions/snackbar";

const StyledBadge = withStyles((theme) => ({
    badge: {
        background: color.primary,
        top: 6,
        right: 10
    },
}))(Badge);

const useStyles = makeStyles((theme) => ({
    root: {
        top: 0,
        width: "100%",
        position: "fixed"
    },
    navContainer: {},
    nav: {
        "& .MuiAppBar-colorPrimary": {
            backgroundColor: color.secondaryDark,
            padding: theme.spacing(0, 3),
            boxShadow: "none",
        },
    },
    navbar: {
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
    },
    logoStyle: {},
    logo: {
        display: "flex",
        textDecoration: "none",
        color: color.white,
        alignItems: "center",
        "&:hover": {
            textDecoration: "none",
            color: color.white,
        },
    },
    logoImage: {
        width: "38px",
        height: "38px",
        marginRight: "10px",
    },
    logoText: {},
    toolbar: {
        paddingRight: 0,
        fontSize: "0.9rem",
    },
    link: {
        color: color.white,
        textDecoration: "none",
        display: "block",
        padding: '8px 0px',
        borderRadius: '50%',
        marginRight: '5px',
        "&:hover": {
            color: color.primary,
            background: color.secondary,
            borderRadius: '50%',
        },
        "& svg": {
            verticalAlign: 'middle'
        },
        "& span": {
            verticalAlign: 'middle'
        },
        [theme.breakpoints.down("xs")]: {
            display: "none",
        },
        "&.MuiButton-root": {
            minWidth: '42px'
        }
    },
    title: {
        color: color.secondary,
        fontWeight: '900'
    },
    anchor: {
        color: color.white,
        textDecoration: "none",
        display: "block",
        marginRight: theme.spacing(1),
        "&:hover": {
            color: color.primary,
        },
        [theme.breakpoints.down("xs")]: {
            display: "none",
        },
    },
    button: {
        color: color.white,
        textTransform: "capitalize",
        border: `1px solid ${color.primary}`,
        borderRadius: "15px",
        padding: "5px 20px",
        textDecoration: "none",
        "&:hover": {
            color: color.primary,
        },
    },
    list: {
        width: '360px',
        padding: theme.spacing(3, 0, 0, 0),
    },
    // chatList: {
    //     height: "100%",
    //     width: '360px',
    //     padding: theme.spacing(3, 3, 0, 3),
    // },
    detailedList: {
        width: '360px',
        padding: theme.spacing(3),
        "& h6": {
            paddingLeft: '10px'
        }
    },
    virtualList: {
        width: '360px',
        padding: theme.spacing(3),
        overflow: "auto"
    },
    settingsList: {
        width: '390px',
        padding: theme.spacing(3, 0, 0, 0),
    },
    drawer: {
        "& .MuiDrawer-paper": {
            overflow: "hidden",
            top: '64px',
            height: '82%',
            right: '10px',
            borderRadius: '10px'
        }
    },
    fullList: {
        width: 'auto',
    },
    drawerVirtualBackground: {
        overflow: "auto!important"
    },
    urlBox: {
        padding: '24px 10px',
        "& h5": {
            fontSize: '1rem',
            fontWeight: '900',
            paddingBottom: theme.spacing(2)
        }
    },
    noiseCancellation: {
        width: "24px",
        height: "24px"
    }
}));


const Navbar = ({dominantSpeakerId}) => {
    const dispatch = useDispatch()
    const conference = useSelector(state => state.conference);
    const layout = useSelector(state => state.layout);
    //const unread = useSelector(state => state.chat.unreadMessage);
    const classes = useStyles();
    const recordingSession = useRef(null);
    const streamingSession = useRef(null);

    const [state, setState] = React.useState({
        right: false,
    });

    // const [chatState, setChatState] = React.useState({
    //     right: false,
    // });

    // const [participantState, setParticipantState] = React.useState({
    //     right: false,
    // });

    const [backgroundState, setBackgroundState] = React.useState({
        right: false,
    });

    const [settingsState, setSettingsState] = React.useState({
        right: false,
    });

    const [caption, setCaption] = useState(false);
    const [recording, setRecording] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [openLivestreamDialog, setOpenLivestreamDialog] = useState(false);
    const [broadcasts, setBroadcasts] = useState([]);

    const toggleBackgroundDrawer = (anchor, open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        setBackgroundState({...backgroundState, [anchor]: open});
    };

    const toggleSettingsDrawer = (anchor, open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        setSettingsState({...settingsState, [anchor]: open});
    };

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setState({...state, [anchor]: open});
    };

    // const toggleChatDrawer = (anchor, open) => (event) => {
    //     if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
    //         return;
    //     }
    //     setChatState({...chatState, [anchor]: open});
    //     dispatch(unreadMessage(0));
    // };

    // const toggleParticipantDrawer = (anchor, open) => (event) => {
    //     if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
    //         return;
    //     }
    //     setParticipantState({...participantState, [anchor]: open});
    // };

    const startStreamingCaption = async () => {
        dispatch(showSnackbar({
            severity: "info",
            message: 'Live Streaming to be Launched Soon',
            autoHide: true
        }));
    }

    const startStreaming = async () => {
        if (streaming) {
            return;
        }
        
        if (conference?.getRole() === "none") {
            return dispatch(showNotification({
                severity: "info",
                autoHide: true,
                message: 'You are not moderator!!'
            }));
        }

        await googleApi.signInIfNotSignedIn();
        let youtubeBroadcasts
        
        try  {
            youtubeBroadcasts = await googleApi.requestAvailableYouTubeBroadcasts();
        } catch(e) {
            dispatch(showNotification({autoHide: true, message : e?.result?.error?.message , severity: "info"}));
            return;
        }

        if (youtubeBroadcasts.status !== 200) {
            dispatch(showNotification({autoHide: true, message : "Could not fetch YouTube broadcasts", severity: "info"}));
        }
        setBroadcasts(youtubeBroadcasts.result.items);
        setOpenLivestreamDialog(true);
    }

    const createLiveStream = async()=>{
        const title = `test__${Date.now()}`;
        const resposne = await googleApi.createLiveStreams(title);
        
        const streamName = resposne.cdn?.ingestionInfo?.streamName;
        if (!streamName) {
            return;
        }

        dispatch(showSnackbar({
            severity: "info",
            message: 'Starting Live Streaming',
            autoHide: false
        }));
        const session = await conference.startRecording({
            mode: SariskaMediaTransport.constants.recording.mode.STREAM,
            streamId: `rtmp://a.rtmp.youtube.com/live2/${streamName}`
        });
        streamingSession.current = session;
        setOpenLivestreamDialog(false);
    }

    const selectedBroadcast = async (boundStreamID) => {
        const selectedStream = await googleApi.requestLiveStreamsForYouTubeBroadcast(boundStreamID);

        if (selectedStream.status !== 200) {
            dispatch(showNotification({autoHide: true, message: "No live streams found", severity: "error"}));
            return;
        }

        dispatch(showSnackbar({
            severity: "info",
            message: 'Starting Live Streaming',
            autoHide: false
        }));

        const streamName = selectedStream.result.items[0]?.cdn?.ingestionInfo?.streamName;
        setOpenLivestreamDialog(false);
        const session = await conference.startRecording({
            mode: SariskaMediaTransport.constants.recording.mode.STREAM,
            streamId: `rtmp://a.rtmp.youtube.com/live2/${streamName}`
        });
        streamingSession.current = session;
    }

    const stopStreaming = async () => {
        if (!streaming) {
            return;
        }
        if (conference?.getRole() === "none") {
            return dispatch(showNotification({
                severity: "info",
                autoHide: true,
                message: 'You are not moderator!!'
            }));
        }
        await conference.stopRecording(localStorage.getItem("streaming_session_id"));
    }

    const startRecording = async () => {
        if (recording) {
            return;
        }
        
        if (conference?.getRole() === "none") {
            return dispatch(showNotification({
                severity: "info",
                autoHide: true,
                message: 'You are not moderator!!'
            }));
        }

        const response = await authorizeDropbox();
        if (!response?.token) {
            return dispatch(showNotification({
                severity: "error",
                message: 'Recording failed no dropbox token'
            }));
        }


        // const appData = {
        //    file_recording_metadata : {
        //      'share': true
        //     }
        // }

        const appData = {
            file_recording_metadata: {
                upload_credentials: {
                    service_name: "dropbox",
                    token: response.token,
                    app_key: DROPBOX_APP_KEY,
                    r_token: response.rToken
                }
            }
        }

        dispatch(showSnackbar({
            severity: "info",
            message: 'Starting Recording',
            autoHide: false
        }));

        const session = await conference.startRecording({
            mode: SariskaMediaTransport.constants.recording.mode.FILE,
            appData: JSON.stringify(appData)
        });
        recordingSession.current = session;
    }

    const stopRecording = async () => {
        if (!recording) {
            return;
        }
        if (conference?.getRole() === "none") {
            return dispatch(showNotification({
                severity: "info",
                autoHide: true,
                message: 'You are not moderator!!'
            }));
        }
        await conference.stopRecording(localStorage.getItem("recording_session_id"));
    }

    const startCaption = () => {
        dispatch(showSnackbar({
            severity: "info",
            message: 'Starting Caption',
            autoHide: false
        }));
        conference.setLocalParticipantProperty("requestingTranscription",   true);
    }

    const stopCaption = () => {
        conference.setLocalParticipantProperty("requestingTranscription", false);
    }

    useEffect(() => {
        conference.getParticipantsWithoutHidden().forEach(item=>{
            if (item._properties?.transcribing) {
                setCaption(true);
            }

            if (item._properties?.recording) {
                setRecording(true);
            }

            if (item._properties?.streaming) {
                setStreaming(true);
            }
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.TRANSCRIPTION_STATUS_CHANGED, (status) => {
            if (status === "ON") {
                conference.setLocalParticipantProperty("transcribing", true);
                dispatch(showSnackbar({autoHide: true, message: "Caption started"}));
                setCaption(true);
            }

            if (status === "OFF") {
                conference.removeLocalParticipantProperty("transcribing");
                dispatch(showSnackbar({autoHide: true, message: "Caption stopped"}));
                dispatch(addSubtitle({}));
                setCaption(false);
            }
        });

        conference.addEventListener(SariskaMediaTransport.events.conference.RECORDER_STATE_CHANGED, (data) => {
            if (data._status === "on" && data._mode === "stream") {
                conference.setLocalParticipantProperty("streaming", true);
                dispatch(showSnackbar({autoHide: true, message: "Live streaming started"}));
                setStreaming(true);
                localStorage.setItem("streaming_session_id", data?._sessionID)
            }

            if (data._status === "off" && data._mode === "stream") {
                conference.removeLocalParticipantProperty("streaming");
                dispatch(showSnackbar({autoHide: true, message: "Live streaming stopped"}));
                setStreaming(false);
            }

            if (data._status === "on" && data._mode === "file") {
                conference.setLocalParticipantProperty("recording", true);
                dispatch(showSnackbar({autoHide: true, message: "Recording started"}));
                setRecording(true);
                localStorage.setItem("recording_session_id", data?._sessionID)
            }

            if (data._status === "off" && data._mode === "file") {
                conference.removeLocalParticipantProperty("recording");
                dispatch(showSnackbar({autoHide: true, message: "Recording stopped"}));
                setRecording(false);
            }

            if (data._mode === "stream" && data._error) {
                conference.removeLocalParticipantProperty("streaming");
                dispatch(showSnackbar({autoHide: true, message: RECORDING_ERROR_CONSTANTS[data._error]}));
                setStreaming(false);
            }

            if (data._mode === "file" && data._error) {
                conference.removeLocalParticipantProperty("recording");
                dispatch(showSnackbar({autoHide: true, message: RECORDING_ERROR_CONSTANTS[data._error]}));
                setRecording(false);
            }
        });

    }, []);

    const detailedList = (anchor) => (
        <Box
            className={classes.detailedList}
            role="presentation"
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <Typography variant="h6" className={classes.title}>Meeting Info</Typography>
            <Box className={classes.urlBox}>
                <Typography variant="h5" className={classes.title1}>
                    Shared URL
                </Typography>
                <CopyLink onClick={toggleDrawer}/>
            </Box>
        </Box>
    );
    // const chatList = (anchor) => (
    //     <Box
    //         className={classes.chatList}
    //         role="presentation"
    //     >
    //         <Typography variant="h6" className={classes.title}>Chat Details</Typography>
    //         <Chat/>
    //     </Box>
    // );
    // const participantList = (anchor) => (
    //     <Box
    //         className={classes.list}
    //         role="presentation"
    //     >
    //         <Typography variant="h6" className={classes.title} style={{paddingLeft: '24px'}}>Participant
    //             Details</Typography>
    //         <ParticipantDetails/>
    //     </Box>
    // );
    const virtualBackgroundList = (anchor) => (
        <Box
            className={classes.virtualList}
            role="presentation"
            onKeyDown={toggleBackgroundDrawer(anchor, false)}
        >
            <VirtualBackground dominantSpeakerId={dominantSpeakerId}/>
        </Box>
    );
    const settingsList = (anchor) => (
        <Box
            className={classes.settingsList}
            role="presentation"
            onKeyDown={toggleSettingsDrawer(anchor, false)}
        >
            <SettingsBox/>
        </Box>
    );
    
    const closeLiveStreamDialog = ()=>{
        setOpenLivestreamDialog(false);
    }

    return (
        <Box style={{display: layout.mode === EXIT_FULL_SCREEN_MODE ? "block": "none"}} id="header" className={classes.root}>
            <Box className={classes.navContainer}>
                <Box className={classes.nav}>
                    <AppBar position="static">
                        <Box className={classes.navbar}>
                            <Logo/>
                            <Box className={classes.navLink}>
                                <Toolbar className={classes.toolbar}>
                                    
                                    <Drawer anchor="right" open={settingsState["right"]}
                                            onClose={toggleSettingsDrawer("right", false)} className={classes.drawer}>
                                        {settingsList("right")}
                                    </Drawer>
                                </Toolbar>
                            </Box>
                        </Box>
                    </AppBar>
                </Box>
            </Box>
            <LiveStreamDialog close={closeLiveStreamDialog} createLiveStream={createLiveStream} open={openLivestreamDialog} broadcasts={broadcasts}
                              selectedBroadcast={selectedBroadcast}/>
        </Box>
    );
};

export default Navbar;
